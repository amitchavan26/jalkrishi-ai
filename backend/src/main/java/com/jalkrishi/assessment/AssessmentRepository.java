package com.jalkrishi.assessment;

import com.jalkrishi.engine.Stress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    Assessment findByIdAndOwnerId(String id, String ownerId);
    List<Assessment> findByOwnerIdAndStressOrderByCreatedAtDesc(String ownerId, Stress stress);
}