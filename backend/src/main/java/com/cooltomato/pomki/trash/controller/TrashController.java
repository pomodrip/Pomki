package com.cooltomato.pomki.trash.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.trash.dto.TrashResponseDto;
import com.cooltomato.pomki.trash.service.TrashService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trash")
@RequiredArgsConstructor
@Tag(name = "Trash", description = "쓰레기통 API")
public class TrashController {
    
    private final TrashService trashService;
    
    @GetMapping
    @Operation(summary = "쓰레기통 목록 조회", description = "사용자의 쓰레기통에 있는 모든 항목을 조회합니다.")
    public ResponseEntity<TrashResponseDto> getTrashItems(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        TrashResponseDto response = trashService.getTrashItems(principal);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/deck/{deckId}")
    @Operation(summary = "덱을 쓰레기통으로 이동", description = "지정된 덱을 쓰레기통으로 이동합니다.")
    public ResponseEntity<String> moveDeckToTrash(
            @PathVariable String deckId,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        trashService.moveDeckToTrash(deckId, principal);
        return ResponseEntity.ok("덱이 쓰레기통으로 이동되었습니다.");
    }
    
    @PostMapping("/card/{cardId}")
    @Operation(summary = "카드를 쓰레기통으로 이동", description = "지정된 카드를 쓰레기통으로 이동합니다.")
    public ResponseEntity<String> moveCardToTrash(
            @PathVariable Long cardId,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        trashService.moveCardToTrash(cardId, principal);
        return ResponseEntity.ok("카드가 쓰레기통으로 이동되었습니다.");
    }
    
    @PostMapping("/note/{noteId}")
    @Operation(summary = "노트를 쓰레기통으로 이동", description = "지정된 노트를 쓰레기통으로 이동합니다.")
    public ResponseEntity<String> moveNoteToTrash(
            @PathVariable String noteId,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        trashService.moveNoteToTrash(noteId, principal);
        return ResponseEntity.ok("노트가 쓰레기통으로 이동되었습니다.");
    }
    
    @PostMapping("/restore/{trashId}")
    @Operation(summary = "쓰레기통에서 복원", description = "쓰레기통에 있는 항목을 원래 위치로 복원합니다.")
    public ResponseEntity<String> restoreFromTrash(
            @PathVariable String trashId,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        trashService.restoreFromTrash(trashId, principal);
        return ResponseEntity.ok("항목이 복원되었습니다.");
    }
    
    @DeleteMapping("/{trashId}")
    @Operation(summary = "영구 삭제", description = "쓰레기통에 있는 항목을 영구적으로 삭제합니다.")
    public ResponseEntity<String> permanentDelete(
            @PathVariable String trashId,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        trashService.permanentDelete(trashId, principal);
        return ResponseEntity.ok("항목이 영구 삭제되었습니다.");
    }
    
    @PostMapping("/cleanup")
    @Operation(summary = "오래된 항목 정리", description = "30일 이상 된 쓰레기통 항목을 자동으로 삭제합니다.")
    public ResponseEntity<String> cleanupOldTrashItems() {
        trashService.cleanupOldTrashItems();
        return ResponseEntity.ok("오래된 쓰레기통 항목이 정리되었습니다.");
    }
} 