package com.smartcampus.services;

import com.smartcampus.exceptions.ResourceNotFoundException;
import com.smartcampus.models.Ticket;
import com.smartcampus.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket, String userId) {
        ticket.setUserId(userId);
        ticket.setStatus("OPEN");
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByUserId(userId);
    }
    
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public Ticket updateTicketStatus(String id, String status, String notes, String rejectionReason, String userId) {
        Ticket ticket = getTicketById(id);
        
        // Basic workflow transition logic could go here
        ticket.setStatus(status);
        if (notes != null) ticket.setResolutionNotes(notes);
        if (rejectionReason != null) ticket.setRejectionReason(rejectionReason);
        
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String id, String technicianId, String adminUserId) {
        // Admin user verification would happen via role eventually, left as placeholder for Module E
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTechnicianId(technicianId);
        
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }
        
        return ticketRepository.save(ticket);
    }
    
    public Ticket addAttachments(String id, List<String> fileUrls) {
        if (fileUrls == null || fileUrls.isEmpty()) {
            throw new IllegalArgumentException("File URLs cannot be null or empty");
        }
        
        Ticket ticket = getTicketById(id);
        List<String> currentUrls = ticket.getAttachmentUrls();
        
        // Initialize with current URLs or empty list
        if (currentUrls == null) {
            currentUrls = new ArrayList<>();
        }
        
        // Validate total count before modifying
        if (currentUrls.size() + fileUrls.size() > 3) {
            throw new IllegalArgumentException("A ticket can have a maximum of 3 attachments. Current: " + currentUrls.size() + ", Requested: " + fileUrls.size());
        }
        
        currentUrls.addAll(fileUrls);
        ticket.setAttachmentUrls(currentUrls);
        return ticketRepository.save(ticket);
    }
}
