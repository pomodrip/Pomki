package com.cooltomato.pomki.note.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "note_image")
@Data
public class NoteImage {

    @Id
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

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "ori_file_name", nullable = false, length = 512)
    private String oriFileName;

    @Column(name = "resize_image_url", length = 512)
    private String resizeImageUrl;
}

