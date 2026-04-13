package com.example.terraspoter.repository;

import com.example.terraspoter.model.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumReplyRepository extends JpaRepository<ForumReply, Long> {
    List<ForumReply> findByQuestionIdOrderByCreatedAtAsc(Long questionId);
}
