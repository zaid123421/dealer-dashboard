import type { Role } from "@/shared/config/roles";
import { ROLES } from "@/shared/config/roles";
import { normalizeBackendRole } from "@/shared/lib/normalize-backend-role";
import type { AuthUser } from "@/shared/types/auth-session";
import type { DealerProfile } from "@/modules/dealer/types/dealer-profile";
import { getDealerMe } from "@/modules/dealer/services/dealer-me.service";
import { writeDealerProfileCache } from "@/modules/dealer/lib/dealer-profile-cache";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";

export type SyncDealerSessionResult = {
  user: AuthUser;
  role: Role;
  profile: DealerProfile;
};

export function mapDealerProfileToAuthUser(
  profile: DealerProfile,
  expiresInSeconds?: number,
): AuthUser {
  const { dealer, currentUser } = profile;
  const existing = TokenService.getAuthProfile();

  return {
    email: currentUser.email,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    backendRole: currentUser.roleName,
    accessLevel: currentUser.accessLevel,
    userActive: currentUser.userActive,
    tenantType: "DEALER",
    tenantId: dealer.id,
    tenantName: dealer.businessName || dealer.legalName,
    expiresInSeconds:
      expiresInSeconds ??
      existing?.expiresInSeconds ??
      900,
  };
}

export function mapDealerProfileToAppRole(profile: DealerProfile): Role {
  return normalizeBackendRole(profile.currentUser.roleName) ?? ROLES.SUPPLIER;
}

/** Fetches GET /v1/dealer/me and syncs cookies + auth store. */
export async function syncDealerSessionFromMeApi(): Promise<SyncDealerSessionResult> {
  const profile = await getDealerMe();
  const user = mapDealerProfileToAuthUser(profile);
  const role = mapDealerProfileToAppRole(profile);

  TokenService.updateAuthSession({ user, appRole: role });
  useAuthStore.getState().setSession(role, user, profile);
  writeDealerProfileCache(profile);

  return { user, role, profile };
}
