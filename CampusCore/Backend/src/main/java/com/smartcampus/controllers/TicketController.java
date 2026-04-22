package com.smartcampus.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.models.Ticket;
import com.smartcampus.services.FileUploadService;
import com.smartcampus.services.TicketService;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/v1/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private FileUploadService fileUploadService;

    // Create a new Ticket
    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestPart("ticketData") Ticket ticket,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_default") String userId) {
        
        try {
            List<String> fileUrls = new ArrayList<>();
            if (files != null) {
                if (files.length > 3) {
                    return ResponseEntity.badRequest().body("Maximum 3 attachments allowed.");
                }
                for (MultipartFile file : files) {
                    fileUrls.add(fileUploadService.saveFile(file));
                }
            }
            
            ticket.setAttachmentUrls(fileUrls);
            Ticket savedTicket = ticketService.createTicket(ticket, userId);
            
            return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading files: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all ticket 
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userIdParam,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_default") String headerUserId) {
            
        if (userIdParam != null) {
            return ResponseEntity.ok(ticketService.getTicketsByUser(userIdParam));
        }
        if (status != null) {
            return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // Get single ticket
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin_default") String userId) {
            
        String status = payload.get("status");
        String notes = payload.get("resolutionNotes");
        String rejectionReason = payload.get("rejectionReason");
        
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes, rejectionReason, userId));
    }

    // Assign Technician
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin_default") String adminUserId) {
            
        String technicianId = payload.get("technicianId");
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId, adminUserId));
    }
}
