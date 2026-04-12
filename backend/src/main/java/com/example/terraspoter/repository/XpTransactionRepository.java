/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for XpTransaction — full audit log of XP awarded to users.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.XpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface XpTransactionRepository extends JpaRepository<XpTransaction, Long> {

    List<XpTransaction> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.xpAwarded), 0) FROM XpTransaction t WHERE t.userId = :userId AND t.action = :action")
    int sumXpByUserIdAndAction(Long userId, String action);

    long countByUserIdAndAction(Long userId, String action);

    /** Used by backfill to skip already-awarded XP for a specific record */
    boolean existsByUserIdAndActionAndReferenceId(Long userId, String action, Long referenceId);
}
