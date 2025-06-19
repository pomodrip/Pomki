// 멤버 기본 정보
export interface Member {
  memberId: number;
  memberEmail: string;
  currentEmail: string;
  memberNickname: string;
  socialProvider?: string;
  socialProviderUserId?: string;
  memberRoles: string;
  emailVerified: boolean;
  isSocialLogin: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
}

// 멤버 프로필 업데이트 요청
export interface UpdateMemberRequest {
  currentEmail: string;
  nickname: string;
  currentPassword: string;
  emailChanger: boolean;
}

// 이메일 변경 요청
export interface ChangeEmailRequest {
  newEmail: string;
  token: string;
}

// 멤버 생성 요청
export interface CreateMemberRequest {
  email: string;
  nickname: string;
  password: string;
  verificationToken: string;
}

// 내 정보 조회 응답
export interface MyInfoResponse {
  email: string;
  nickname: string;
}
