"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/profile";
import { encryptString } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

// Ensure candidate is authenticated and authorized
async function getAuthorizedCandidate() {
  const profile = await getUserProfile();
  if (!profile || profile.account_type !== "institute_candidate") {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function updateCandidatePersonalDetails(payload: any) {
  const profile = await getAuthorizedCandidate();

  // Ensure users only update their own profile
  if (payload.profile_id !== profile.id) {
    throw new Error("Forbidden: Cannot update another user's profile.");
  }

  // Encrypt the Aadhaar number if it exists and hasn't been masked
  if (payload.aadhaar_number) {
    if (payload.aadhaar_number.includes("*")) {
      // It's a masked version passed from the client, meaning it wasn't changed.
      // Remove it from the payload so we don't overwrite the real encrypted value with the mask.
      delete payload.aadhaar_number;
    } else {
      // It's a new plain-text value, so encrypt it.
      payload.aadhaar_number = encryptString(payload.aadhaar_number);
    }
  }

  const supabase = await createClient();

  const updateData = {
    first_name: payload.first_name,
    middle_name: payload.middle_name,
    last_name: payload.last_name,
    gender: payload.gender,
    phone_number: payload.phone_number,
    date_of_birth: payload.date_of_birth,
    current_address: payload.current_address,
    permanent_address: payload.permanent_address,
    profile_updated: true
  } as any;

  if (payload.aadhaar_number !== undefined) {
    updateData.aadhaar_number = payload.aadhaar_number;
  }

  // Update profiles table directly
  const { error: profileError } = await (supabase as any)
    .from("profiles")
    .update(updateData)
    .eq("id", profile.id);

  if (profileError) {
    console.error("Profiles Table Error:", profileError);
    throw new Error(profileError.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

// ─── Bio Actions ──────────────────────────────────────────────────────────────

export async function updateCandidateBioAction(bio: string) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("profiles")
    .update({ bio })
    .eq("id", profile.id);

  if (error) {
    console.error("updateCandidateBioAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

// ─── Skills Actions ───────────────────────────────────────────────────────────

export async function syncCandidateSkillsAction(skillIds: string[]) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  // Delete all existing candidate skills for this profile
  const { error: deleteError } = await (supabase as any)
    .from("candidate_skills")
    .delete()
    .eq("profile_id", profile.id);

  if (deleteError) {
    console.error("syncCandidateSkillsAction delete error:", deleteError);
    throw new Error(deleteError.message);
  }

  // Insert the new set of skills (if any)
  if (skillIds.length > 0) {
    const rows = skillIds.map((skill_id) => ({
      profile_id: profile.id,
      skill_id,
    }));

    const { error: insertError } = await (supabase as any)
      .from("candidate_skills")
      .insert(rows);

    if (insertError) {
      console.error("syncCandidateSkillsAction insert error:", insertError);
      throw new Error(insertError.message);
    }
  }

  revalidatePath("/myprofile");
  return { success: true };
}



export async function saveExperienceAction(payload: any) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const data = {
    ...payload,
    profile_id: profile.id,
    start_date: payload.start_date || null,
    end_date: payload.end_date || null,
  };

  const { error } = await (supabase as any)
    .from("candidate_experiences")
    .upsert(data);

  if (error) {
    console.error("saveExperienceAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

export async function deleteExperienceAction(id: string) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("candidate_experiences")
    .delete()
    .eq("id", id)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("deleteExperienceAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

// ─── Project Actions ──────────────────────────────────────────────────────────

export async function saveProjectAction(payload: any) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const data = {
    ...payload,
    profile_id: profile.id,
    start_date: payload.start_date || null,
    end_date: payload.end_date || null,
  };

  const { error } = await (supabase as any)
    .from("candidate_projects")
    .upsert(data);

  if (error) {
    console.error("saveProjectAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

export async function deleteProjectAction(id: string) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("candidate_projects")
    .delete()
    .eq("id", id)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("deleteProjectAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

// ─── Certification Actions ────────────────────────────────────────────────────

export async function saveCertificationAction(payload: any) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const data = {
    ...payload,
    profile_id: profile.id,
    issue_date: payload.issue_date || null,
    expiration_date: payload.expiration_date || null,
  };

  const { error } = await (supabase as any)
    .from("candidate_certifications")
    .upsert(data);

  if (error) {
    console.error("saveCertificationAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

export async function deleteCertificationAction(id: string) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("candidate_certifications")
    .delete()
    .eq("id", id)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("deleteCertificationAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}

// ─── Refactored Server Actions ────────────────────────────────────────────────

export async function updateCandidateAccountAction(username: string) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const trimmedUsername = username.trim() || null;
  
  if (trimmedUsername !== profile.username) {
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ username: trimmedUsername })
      .eq("id", profile.id);

    if (error) {
      if (error.code === "23505") {
        throw new Error("This username is already taken.");
      }
      console.error("updateCandidateAccountAction Error:", error);
      throw new Error(error.message);
    }
    
    await supabase.auth.updateUser({ 
      data: { username: trimmedUsername, account_type: profile.account_type } 
    });
  }

  revalidatePath("/myprofile");
  return { success: true };
}

export async function updateCandidateEducationSectionAction(payload: any) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();
  
  // 1. Save main academic details
  const { error: profileError } = await (supabase as any)
    .from("candidate_academic_details")
    .upsert({
      profile_id: profile.id,
      course_id: payload.courseId || null,
      passout_year: payload.passoutYear ? Number(payload.passoutYear) : null,
      university_prn: payload.universityPrn?.trim() || null,
    }, { onConflict: 'profile_id' });

  await (supabase as any)
    .from("profiles")
    .update({ institute_id: payload.instituteId || null })
    .eq("id", profile.id);

  if (profileError) {
    if (profileError.code === "PGRST116") {
      throw new Error("Please save Personal Details first.");
    }
    console.error("candidate_academic_details upsert error:", profileError);
    throw new Error(profileError.message);
  }

  // 1.5. Save Semester Grades
  if (payload.isCourseConfigured) {
    await (supabase as any)
      .from("candidate_semester_grades")
      .delete()
      .eq("profile_id", profile.id);

    const gradesToInsert = (payload.sgpaValues || []).map((val: any, index: number) => {
      const num = val ? parseFloat(val) : null;
      if (num !== null && !isNaN(num)) {
        return {
          profile_id: profile.id,
          semester_number: index + 1,
          sgpa: num
        };
      }
      return null;
    }).filter(Boolean);

    if (gradesToInsert.length > 0) {
      const { error: gradesError } = await (supabase as any)
        .from("candidate_semester_grades")
        .insert(gradesToInsert);
      if (gradesError) {
        console.error("candidate_semester_grades insert error:", gradesError);
        throw new Error(gradesError.message);
      }
    }
  }

  // Helper to construct education upserts
  const educations = [];
  
  // 2. Save SSC Education
  if (payload.sscPercentage && payload.sscPassYear) {
    educations.push({
      profile_id: profile.id,
      type: "ssc",
      institution_name: payload.sscInstitution?.trim() || "High School",
      grade_or_percentage: Number(payload.sscPercentage),
      passout_year: Number(payload.sscPassYear),
    });
  }
  
  // 3. Save HSC Education
  if (payload.isHsc && payload.hscPercentage && payload.hscPassYear) {
    educations.push({
      profile_id: profile.id,
      type: "hsc",
      institution_name: payload.hscInstitution?.trim() || "Junior College",
      grade_or_percentage: Number(payload.hscPercentage),
      passout_year: Number(payload.hscPassYear),
    });
  } else {
    await (supabase as any).from("candidate_education").delete().eq("profile_id", profile.id).eq("type", "hsc");
  }

  // 4. Save Diploma Education
  if (payload.isDiploma && payload.diplomaPercentage && payload.diplomaPassYear) {
    educations.push({
      profile_id: profile.id,
      type: "diploma",
      institution_name: payload.diplomaInstitution?.trim() || "Diploma Institute",
      grade_or_percentage: Number(payload.diplomaPercentage),
      passout_year: Number(payload.diplomaPassYear),
    });
  } else {
    await (supabase as any).from("candidate_education").delete().eq("profile_id", profile.id).eq("type", "diploma");
  }

  // Batch upsert educations using the unique constraint on (profile_id, type)
  if (educations.length > 0) {
    const { error: eduError } = await (supabase as any)
      .from("candidate_education")
      .upsert(educations, { onConflict: 'profile_id,type' });
    
    if (eduError) {
      console.error("candidate_education upsert error:", eduError);
      throw new Error(eduError.message);
    }
  }

  revalidatePath("/myprofile");
  return { success: true };
}

export async function updateCandidateProfessionalLinksAction(payload: any) {
  const profile = await getAuthorizedCandidate();
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      linkedin_url: payload.linkedin_url?.trim() || null,
      github_url: payload.github_url?.trim() || null,
      portfolio_links: payload.portfolio_links?.filter((l: string) => l.trim()) || [],
    })
    .eq("id", profile.id);

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Please save Personal Details first.");
    }
    console.error("updateCandidateProfessionalLinksAction Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/myprofile");
  return { success: true };
}
