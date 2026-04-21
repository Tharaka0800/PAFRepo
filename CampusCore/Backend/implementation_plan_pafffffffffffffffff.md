# Module C – Maintenance & Incident Ticketing Implementation Plan

This plan details the implementation of Module C for the Smart Campus Operations Hub. It includes a Spring Boot REST API for the backend and a React client (created via Vite) for the frontend. MongoDB will be used for data persistence.

## Proposed Changes

### 1. Backend: Spring Boot Initialization & Configurations

- Rewrite `pom.xml` to include `spring-boot-starter-web`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-validation`, and `lombok`.
- Create the Main Spring Boot Application class (`SmartCampusApplication`).
- Create `application.properties` with MongoDB connection details and file upload limits (e.g., max file size for images).
- Set up a local `/uploads` directory to serve static attachment images.

### 2. Backend: Models & Repositories (MongoDB)

#### [NEW] `src/main/java/com/smartcampus/models/Ticket.java`
- Fields: `id`, `resourceLocation`, `category`, `description`, `priority`, `preferredContact`, `status` (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED), `rejectionReason`, `resolutionNotes`, `assignedTechnicianId`, `attachmentUrls` (List of Strings, max 3), `createdAt`, `updatedAt`, `userId` (submitted by).

#### [NEW] `src/main/java/com/smartcampus/models/TicketComment.java`
- Fields: `id`, `ticketId`, `userId`, `authorName`, `text`, `createdAt`.

#### [NEW] `src/main/java/com/smartcampus/repositories/TicketRepository.java` & `CommentRepository.java`
- MongoRepository interfaces for CRUD operations.

### 3. Backend: Services & Controllers

> [!NOTE]
> All controllers are prefixed with `/api/v1`. Authentication checks in services take a `userId` argument against ticket/comment data.

#### [NEW] `src/main/java/com/smartcampus/services/TicketService.java` & `CommentService.java`
- Business logic for workflow transitions.
- Validates the 3-image max for attachments.
- Expects `userId` parameters from controllers to validate ownership (edit/delete rights) – ready to easily swap with JWT Principal later.

#### [NEW] `src/main/java/com/smartcampus/controllers/TicketController.java` & `CommentController.java`
- `POST /api/v1/tickets`: Create ticket (handles `multipart/form-data` for images).
- `GET /api/v1/tickets`: List all tickets (with status/role filtering).
- `GET /api/v1/tickets/{id}`: View specific ticket.
- `PUT /api/v1/tickets/{id}/status`: Update ticket status/notes.
- `PUT /api/v1/tickets/{id}/assign`: Assign a technician.
- `POST /api/v1/tickets/{id}/comments`: Add comment.
- `PUT /api/v1/comments/{id}` & `DELETE /api/v1/comments/{id}`: Edit/Delete comment (with ownership rules).

### 4. Frontend: React Application (Vite)

#### [NEW] `frontend/` (Directory)
Initialize a React application using Vite and Vanilla CSS. We will implement a rich, dynamic design (glassmorphism, clean layouts, micro-animations) utilizing a modern White & Blue university palette.

#### Components & Pages
- **`TicketDashboard`**: Main view listing tickets. Includes status pills, filtering, and modern table/card layouts.
- **`CreateTicketModal`**: Form to submit a new ticket. Includes drag-and-drop or file input for up to 3 image attachments.
- **`TicketDetailsPage`**: Detailed view displaying ticket info, attached evidence images, assigning technicians, status update workflow, and a comment section.
- **`CommentSection`**: A modular component for submitting, editing, and deleting comments with ownership validation.

## Verification Plan

### Automated Tests
- Postman collections / curl testing.

### Manual Verification
1. Start the Spring Boot backend (`mvn spring-boot:run`).
2. Start the React frontend (`npm run dev`).
3. Open the browser and test the end-to-end workflow: Creating a ticket with attachments, assigning a technician, updating the status to RESOLVED, and adding/editing a comment.
