package com.smartcampus.repositories;

import com.smartcampus.models.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<TicketComment, String> {
    List<TicketComment> findByTicketId(String ticketId);
}
