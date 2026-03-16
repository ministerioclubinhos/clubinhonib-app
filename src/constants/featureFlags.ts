export interface FeatureFlags {
  teacher_children_access: boolean;
  teacher_photo_upload: boolean;
  teacher_weekly_materials: boolean;
  teacher_site_feedback: boolean;
  teacher_share_idea: boolean;
  events_section: boolean;
  ideas_sharing: boolean;
  clubinho_feed: boolean;
  admin_statistics: boolean;
  admin_club_control: boolean;
  admin_pagelas: boolean;
}

export const MOCKED_FEATURE_FLAGS: FeatureFlags = {
  teacher_children_access: false,
  teacher_photo_upload: true,
  teacher_weekly_materials: true,
  teacher_site_feedback: true,
  teacher_share_idea: true,
  events_section: true,
  ideas_sharing: true,
  clubinho_feed: true,
  admin_statistics: true,
  admin_club_control: true,
  admin_pagelas: true,
};
