'use server';
import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases, messaging} from "../appwrite.config";
import { parseStringify } from "../utils";
import type { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
import {formatDateTime} from "../utils";
export const createAppointment = async (appointment: CreateAppointmentParams) => {
   try {
    const newAppointment = await databases.createDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        appointment
        
    )
    return parseStringify(newAppointment);
   } catch (error) {
    
    console.log(error);
   }  
}

export const getAppointment = async (appointmentId: string) => {
    try {
        const appointment = await databases.getDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,

        )
        return parseStringify(appointment);
    } catch (error) {
        console.log(error);
    }
}

export const getRecentAppointmentList = async () => {
    try {
        const appointments = await databases.listDocuments(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            [Query.orderDesc('$createdAt')],
        );
        const initialCounts = {
            scheduledCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
          };
      
          const counts = (appointments.documents as Appointment[]).reduce(
            (acc, appointment) => {
              switch (appointment.status) {
                case "scheduled":
                  acc.scheduledCount++;
                  break;
                case "pending":
                  acc.pendingCount++;
                  break;
                case "cancelled":
                  acc.cancelledCount++;
                  break;
              }
              return acc;
            },
            initialCounts
          );
      
          const data = {
            totalCount: appointments.total,
            ...counts,
            documents: appointments.documents,
          };
          revalidatePath("/admin");
          return parseStringify(data);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        // Return an appropriate default value in case of error
        return {
            totalCount: 0,
            scheduledCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
            documents: [],
        };
    } 
}

export const updateAppointment = async ({appointmentId, userId, timeZone, appointment, type}: UpdateAppointmentParams) => {
  try {
    const updateAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    )
    if(!updateAppointment) {
      throw new Error("Failed to update appointment");
    }
    //TODO SMS notification
    const smsMessage = `
      Hi, it's CarePulse. 
      ${type === 'schedule' ? 
        `Your appointment has been scheduled for ${formatDateTime(appointment.schedule!)}` 
        : 'We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}'}.
    `
    revalidatePath("/admin");
    await sendSMSNotification(userId, smsMessage);
    
    return parseStringify(updateAppointment);
  } catch (error) {
    console.log(error);
  }
}

export const sendSMSNotification = async (userId: string, content: string ) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
       content,
       [],
       [userId]
    )
    return parseStringify(message);
  } catch (error) {
    console.log(error);
  }
}