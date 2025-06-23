package com.cooltomato.pomki.noteimage.entity;

import com.cooltomato.pomki.note.entity.Note;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTE_IMAGE")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NoteImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    private Note note;

    @Column(name = "image_url", nullable = false, length = 512)
    private String imageUrl;

    @Column(name = "image_name", length = 255)
    private String imageName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ori_file_name", nullable = false, length = 512)
    private String oriFileName;

    @Column(name = "resize_image_url", length = 512)
    private String resizeImageUrl;

    @Builder
    public NoteImage(Note note, String imageUrl, String imageName, Long fileSize, 
                     String mimeType, String oriFileName, String resizeImageUrl) {
        this.note = note;
        this.imageUrl = imageUrl;
        this.imageName = imageName;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.oriFileName = oriFileName;
        this.resizeImageUrl = resizeImageUrl;
    }
} 