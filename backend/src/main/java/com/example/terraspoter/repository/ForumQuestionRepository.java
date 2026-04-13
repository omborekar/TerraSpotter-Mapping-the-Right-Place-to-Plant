package com.example.terraspoter.repository;

import com.example.terraspoter.model.ForumQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumQuestionRepository extends JpaRepository<ForumQuestion, Long> {
    List<ForumQuestion> findAllByOrderByCreatedAtDesc();
}
