import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Equipment, EquipmentDocument, EquipmentStatus } from '../../equipment/schemas/equipment.schema';
import { Reservation, ReservationDocument, ReservationStatus } from '../../reservations/schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AvailabilityStatus } from './dto/responses.dto';
import { SearchAvailabilityDto } from './dto/search-availability.dto';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Midnight UTC of the given date. Reservations are per calendar day. */
const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

@Injectable()
export class F1AvailabilityReservationsService {
  constructor(
    @InjectModel(Equipment.name) private readonly equipment: Model<EquipmentDocument>,
    @InjectModel(Reservation.name) private readonly reservations: Model<ReservationDocument>,
  ) {}

  /**
   * R01 + BR-01: search the catalogue and compute each item's availability at the moment of the search.
   *  - CHECKED_OUT: the item is currently on loan (set by F2 at check-out)
   *  - RESERVED:    the item is not checked out and has an active reservation for today
   *  - AVAILABLE:   neither
   * Retired items are not listed. F1 never changes Equipment.status.
   */
  async search(q: SearchAvailabilityDto) {
    const filter: FilterQuery<EquipmentDocument> = { status: { $ne: EquipmentStatus.RETIRED } };
    if (q.search?.trim()) filter.name = { $regex: escapeRegex(q.search.trim()), $options: 'i' };
    if (q.category?.trim()) filter.category = { $regex: `^${escapeRegex(q.category.trim())}$`, $options: 'i' };
    if (q.canLeaveMakerspace !== undefined) filter.canLeaveMakerspace = q.canLeaveMakerspace;

    const items = await this.equipment.find(filter).sort({ name: 1 }).lean();

    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const reservedToday = await this.reservations
      .find({
        equipment: { $in: items.map((i) => i._id) },
        status: ReservationStatus.ACTIVE,
        reservedFor: { $gte: today, $lt: tomorrow },
      })
      .select('equipment')
      .lean();
    const reservedIds = new Set(reservedToday.map((r) => String(r.equipment)));

    let result = items.map((i) => ({
      _id: String(i._id),
      name: i.name,
      category: i.category,
      canLeaveMakerspace: i.canLeaveMakerspace,
      requiresSafetyBriefing: i.requiresSafetyBriefing,
      location: i.location,
      availability:
        i.status === EquipmentStatus.ON_LOAN
          ? AvailabilityStatus.CHECKED_OUT
          : i.status === EquipmentStatus.RESERVED || reservedIds.has(String(i._id))
            ? AvailabilityStatus.RESERVED
            : AvailabilityStatus.AVAILABLE,
    }));
    if (q.availability) result = result.filter((r) => r.availability === q.availability);
    return result;
  }

  /**
   * R02: reserve an item for one future calendar day, if the item is not checked out
   * at the time of the request and has no active reservation for that day.
   */
  async createReservation(userId: string, dto: CreateReservationDto) {
    const item = await this.equipment.findById(dto.equipmentId);
    if (!item) throw new NotFoundException('Equipment not found');
    if (item.status === EquipmentStatus.RETIRED) throw new BadRequestException('This equipment has been retired');
    if (item.status === EquipmentStatus.ON_LOAN) {
      throw new BadRequestException('This item is currently checked out and cannot be reserved');
    }

    const day = startOfDay(new Date(dto.date));
    if (day <= startOfDay(new Date())) throw new BadRequestException('Reservation date must be in the future');

    const clash = await this.reservations.findOne({
      equipment: item._id, status: ReservationStatus.ACTIVE, reservedFor: day,
    });
    if (clash) throw new ConflictException('This item is already reserved for that day');

    return this.reservations.create({ equipment: item._id, borrower: userId, reservedFor: day });
  }

  /** The caller's own reservations, newest date first. */
  myReservations(userId: string) {
    return this.reservations
      .find({ borrower: userId })
      .sort({ reservedFor: -1 })
      .populate('equipment', 'name category')
      .lean();
  }

  /** Cancel one of the caller's own active reservations. */
  async cancelReservation(userId: string, id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid reservation id');
    const r = await this.reservations.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');
    if (String(r.borrower) !== String(userId)) throw new ForbiddenException('You can only cancel your own reservations');
    if (r.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(`Reservation is already ${r.status.toLowerCase()}`);
    }
    r.status = ReservationStatus.CANCELLED;
    return r.save();
  }
}