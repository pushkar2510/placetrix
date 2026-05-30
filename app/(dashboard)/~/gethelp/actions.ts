"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createTicketAction(data: { title: string; description: string; email: string }) {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to create a ticket.");
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      title: data.title,
      description: data.description,
      email: data.email,
      user_id: userId,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return ticket;
}

export async function getTicketAction(ticketId: string) {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    return null;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*, profiles(avatar_path, display_name, email)")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return null;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("ticket_messages")
    .select("*, profiles(avatar_path, display_name, email)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  return { ticket, messages };
}

export async function addTicketMessageAction(ticketId: string, message: string) {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to reply.");
  }

  // Verify the ticket exists and user has access (RLS will enforce this as well, but this provides a better error)
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Error("Ticket not found or access denied.");
  }

  // Check if sender is an admin to determine sender_type
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .single();
  const isAdmin = profile?.account_type === "admin";
  const sender_type = isAdmin ? "support" : "user";

  const { error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      message,
      sender_type,
      user_id: userId,
    });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


export async function validateTicketAction(ticketInput: string) {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error("You must be logged in to track a ticket.");
  }

  const input = ticketInput.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);

  const query = supabase.from("tickets").select("id").limit(1);
  if (isUuid) {
    query.eq("id", input);
  } else {
    query.eq("ticket_number", input);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw new Error("Invalid Ticket ID or Number, or you do not have permission to view it.");
  }

  return data.id;
}

export async function getMyTicketsAction() {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    return [];
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .single();
  const isAdmin = profile?.account_type === "admin";

  let query = supabase.from("tickets").select("*");
  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTicketStatusAction(ticketId: string, status: "open" | "in_progress" | "resolved" | "closed") {
  const supabase = await createClient() as SupabaseClient<Database>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Verify the user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .single();

  if (profile?.account_type !== "admin") {
    throw new Error("Unauthorized. Only admins can update ticket status.");
  }

  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
