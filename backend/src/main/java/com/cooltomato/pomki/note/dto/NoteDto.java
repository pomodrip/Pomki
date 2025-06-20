package com.cooltomato.pomki.note.dto;

import com.cooltomato.pomki.note.entity.Note;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class NoteDto {

    @Getter
    @Setter
    public static class CreateRequest {
        @NotBlank(message = "노트 제목은 필수입니다.")
        @Size(max = 255, message = "노트 제목은 255자를 초과할 수 없습니다.")
        private String noteTitle;

        @NotBlank(message = "노트 내용은 필수입니다.")
        private String noteContent;
    }

    @Getter
    @Setter
    public static class UpdateRequest {
        @NotBlank(message = "노트 제목은 필수입니다.")
        @Size(max = 255, message = "노트 제목은 255자를 초과할 수 없습니다.")
        private String noteTitle;

        @NotBlank(message = "노트 내용은 필수입니다.")
        private String noteContent;
    }

    @Getter
    public static class Response {
        private final String noteId;
        private final String noteTitle;
        private final String noteContent;
        private final String originalContent;
        private final Boolean aiEnhanced;
        private final LocalDateTime createdAt;
        private final LocalDateTime updatedAt;

        @Builder
        public Response(String noteId, String noteTitle, String noteContent, 
                       String originalContent, Boolean aiEnhanced,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.noteId = noteId;
            this.noteTitle = noteTitle;
            this.noteContent = noteContent;
            this.originalContent = originalContent;
            this.aiEnhanced = aiEnhanced;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public static Response from(Note note) {
            return Response.builder()
                    .noteId(note.getNoteId())
                    .noteTitle(note.getNoteTitle())
                    .noteContent(note.getNoteContent())
                    .originalContent(note.getOriginalContent())
                    .aiEnhanced(note.getAiEnhanced())
                    .createdAt(note.getCreatedAt())
                    .updatedAt(note.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    public static class PolishRequest {
        @NotBlank(message = "프롬프트 이름은 필수입니다.")
        private String promptName;
    }
} 