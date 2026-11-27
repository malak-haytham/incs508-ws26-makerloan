# Software Requirements Specification for MakerLoan

Version 0.1 (draft)
Prepared by: TODO
German International University, Winter 2026

## Revision History

| Name | Date | Reason For Changes | Version |
|------|------|--------------------|---------|
| Malak Haytham | 2026-11-27 | Added F1 (availability search and reservations): R01–R03, BR-01, assumption A-01, open points | 0.1 |

## 1. Introduction

### 1.1 Purpose
### 1.2 Document Conventions
### 1.3 Intended Audience and Reading Suggestions
### 1.4 Product Scope
### 1.5 References

## 2. Overall Description

### 2.1 Product Perspective
### 2.2 Product Functions
### 2.3 User Classes and Characteristics
### 2.4 Operating Environment
### 2.5 Design and Implementation Constraints
### 2.6 User Documentation
### 2.7 Assumptions and Dependencies

- **A-01 (F1):** The equipment catalogue is small enough that a search returns results within the time stated in R03. The number of items is to be confirmed with the makerspace manager (see Appendix C).

## 3. External Interface Requirements

### 3.1 User Interfaces
### 3.2 Hardware Interfaces
### 3.3 Software Interfaces
### 3.4 Communications Interfaces

## 4. System Features

### F1: Availability Search and Reservations

**Description.** Borrowers (students, staff and lecturers) look up equipment in the makerspace catalogue, see whether an item is Available, Reserved or Checked Out, and reserve an item for a future day without visiting the loan desk. This supports business goal BG2 and, through the status shown for every item, BG1.

**Business rule used by this feature.** BR-01 (availability status), defined in section 5.5.

**Functional requirements**

| ID | Type | Requirement |
|----|------|-------------|
| R01 | Functional | The system shall let a borrower search the equipment catalogue by item name (partial, case-insensitive match) or by category (exact match) and shall display the availability status of each result as defined in BR-01. |
| R02 | Functional | The system shall let an authenticated borrower reserve an item for one selected future calendar day, provided the item is not Checked Out at the time of the request and has no active reservation for that day. |
| R03 | Non-functional (performance) | The system shall return and display the results of an R01 search within 2 seconds, measured from submitting the query to displaying the results, for at least 95% of searches against the catalogue size stated in assumption A-01. |

**Traceability (prototype)**

| Requirement | Backend | Frontend | How to check |
|-------------|---------|----------|--------------|
| R01 | `GET /api/availability` | Search form and results table on the availability page | Search by name and by category and check the status column |
| R02 | `POST /api/reservations` | Reserve button and date picker | Reserve for a future date; today's date gives 400, a repeat gives 409, a checked-out item gives 400 |
| R03 | `tookMs` in the search response | Timing line under the search form | Compare `tookMs` and the round trip against 2000 ms |

### F2:
### F3:
### F4:
### F5:

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements

- The search response time is specified in R03 (F1).

### 5.2 Safety Requirements
### 5.3 Security Requirements
### 5.4 Software Quality Attributes
### 5.5 Business Rules

**BR-01 Availability status.** Every item in the catalogue has one of three statuses:

- **Checked Out:** the item is currently on loan.
- **Reserved:** the item is not Checked Out and has an active reservation for the current day.
- **Available:** the item is neither Checked Out nor Reserved.

Retired items are not shown.

## 6. Other Requirements

## Appendix A: Glossary

- **Borrower:** a student, staff member or lecturer who borrows equipment.
- **Active reservation:** a reservation that has not been cancelled and has not yet been fulfilled by a check-out.

## Appendix B: Analysis Models
## Appendix C: To Be Determined List

- **TBD-F1-1:** Number of items in the catalogue (assumption A-01), to be confirmed with the makerspace manager.
- **TBD-F1-2:** Pickup time and how long a reservation is held.
- **TBD-F1-3:** Cancelling a reservation and viewing "my reservations". The prototype provides both, but R01–R03 do not cover them.
- **TBD-F1-4:** University accounts and single sign-on are simulated by the prototype login.