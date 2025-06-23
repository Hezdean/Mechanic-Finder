import { sendEmail } from './email';

interface BookingNotification {
  bookingId: number;
  customerEmail: string;
  customerName: string;
  mechanicEmail: string;
  mechanicName: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
  };
  price: number;
  notes?: string;
}

interface BookingReminder {
  bookingId: number;
  customerEmail: string;
  customerName: string;
  mechanicEmail: string;
  mechanicName: string;
  serviceType: string;
  scheduledDateTime: Date;
  location: string;
  customerPhone?: string;
  mechanicPhone?: string;
}

// Send booking confirmation to customer
export async function sendBookingConfirmation(booking: BookingNotification): Promise<boolean> {
  try {
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        
        <p>Dear ${booking.customerName},</p>
        
        <p>Your service appointment has been confirmed with the following details:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Service Details</h3>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          <p><strong>Date & Time:</strong> ${new Date(booking.scheduledDate + 'T' + booking.scheduledTime).toLocaleString()}</p>
          <p><strong>Mechanic:</strong> ${booking.mechanicName}</p>
          <p><strong>Location:</strong> ${booking.location}</p>
          <p><strong>Vehicle:</strong> ${booking.vehicleInfo.year} ${booking.vehicleInfo.make} ${booking.vehicleInfo.model}</p>
          <p><strong>Estimated Cost:</strong> $${booking.price}</p>
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #065f46;">What to Expect</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Your mechanic will contact you 24 hours before the appointment</li>
            <li>Please have your vehicle ready and accessible</li>
            <li>Bring any relevant vehicle documentation</li>
            <li>Payment can be made at completion of service</li>
          </ul>
        </div>
        
        <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
        
        <p>Thank you for choosing our auto repair service!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          AutoRepair Platform<br>
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;

    await sendEmail({
      to: booking.customerEmail,
      from: 'noreply@autorepair.com',
      subject: `Appointment Confirmed - ${booking.serviceType} on ${new Date(booking.scheduledDate).toLocaleDateString()}`,
      html: customerEmailHtml,
      text: `Your ${booking.serviceType} appointment has been confirmed for ${booking.scheduledDate} at ${booking.scheduledTime} with ${booking.mechanicName}.`
    });

    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}

// Send booking notification to mechanic
export async function sendMechanicNotification(booking: BookingNotification): Promise<boolean> {
  try {
    const mechanicEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Service Request</h2>
        
        <p>Dear ${booking.mechanicName},</p>
        
        <p>You have received a new service appointment request:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Appointment Details</h3>
          <p><strong>Customer:</strong> ${booking.customerName}</p>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          <p><strong>Date & Time:</strong> ${new Date(booking.scheduledDate + 'T' + booking.scheduledTime).toLocaleString()}</p>
          <p><strong>Vehicle:</strong> ${booking.vehicleInfo.year} ${booking.vehicleInfo.make} ${booking.vehicleInfo.model}</p>
          <p><strong>Estimated Payment:</strong> $${booking.price}</p>
          ${booking.notes ? `<p><strong>Customer Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1e40af;">Next Steps</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Log into your dashboard to accept or modify this appointment</li>
            <li>Contact the customer 24 hours before the scheduled time</li>
            <li>Prepare necessary tools and parts for the service</li>
            <li>Update appointment status after completion</li>
          </ul>
        </div>
        
        <p>Please confirm your availability for this appointment as soon as possible.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          AutoRepair Platform<br>
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;

    await sendEmail({
      to: booking.mechanicEmail,
      from: 'noreply@autorepair.com',
      subject: `New Service Request - ${booking.serviceType} on ${new Date(booking.scheduledDate).toLocaleDateString()}`,
      html: mechanicEmailHtml,
      text: `New service request: ${booking.serviceType} for ${booking.customerName} on ${booking.scheduledDate} at ${booking.scheduledTime}.`
    });

    return true;
  } catch (error) {
    console.error('Error sending mechanic notification:', error);
    return false;
  }
}

// Send appointment reminder (24 hours before)
export async function sendAppointmentReminder(reminder: BookingReminder): Promise<boolean> {
  try {
    // Customer reminder
    const customerReminderHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Appointment Reminder</h2>
        
        <p>Dear ${reminder.customerName},</p>
        
        <p>This is a reminder that you have a service appointment scheduled for tomorrow:</p>
        
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">Tomorrow's Appointment</h3>
          <p><strong>Service:</strong> ${reminder.serviceType}</p>
          <p><strong>Date & Time:</strong> ${reminder.scheduledDateTime.toLocaleString()}</p>
          <p><strong>Mechanic:</strong> ${reminder.mechanicName}</p>
          <p><strong>Location:</strong> ${reminder.location}</p>
          ${reminder.mechanicPhone ? `<p><strong>Mechanic Phone:</strong> ${reminder.mechanicPhone}</p>` : ''}
        </div>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0c4a6e;">Preparation Checklist</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Ensure your vehicle is accessible and ready</li>
            <li>Remove personal items from the vehicle</li>
            <li>Have your keys ready</li>
            <li>Prepare any relevant vehicle documentation</li>
          </ul>
        </div>
        
        <p>If you need to make any changes to your appointment, please contact us immediately.</p>
        
        <p>We look forward to servicing your vehicle!</p>
      </div>
    `;

    await sendEmail({
      to: reminder.customerEmail,
      from: 'noreply@autorepair.com',
      subject: `Reminder: ${reminder.serviceType} appointment tomorrow`,
      html: customerReminderHtml,
      text: `Reminder: Your ${reminder.serviceType} appointment is scheduled for tomorrow at ${reminder.scheduledDateTime.toLocaleString()}.`
    });

    // Mechanic reminder
    const mechanicReminderHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Service Appointment Tomorrow</h2>
        
        <p>Dear ${reminder.mechanicName},</p>
        
        <p>You have a service appointment scheduled for tomorrow:</p>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin-top: 0; color: #581c87;">Tomorrow's Service</h3>
          <p><strong>Customer:</strong> ${reminder.customerName}</p>
          <p><strong>Service:</strong> ${reminder.serviceType}</p>
          <p><strong>Date & Time:</strong> ${reminder.scheduledDateTime.toLocaleString()}</p>
          ${reminder.customerPhone ? `<p><strong>Customer Phone:</strong> ${reminder.customerPhone}</p>` : ''}
        </div>
        
        <p>Please ensure you're prepared for this appointment and contact the customer if needed.</p>
      </div>
    `;

    await sendEmail({
      to: reminder.mechanicEmail,
      from: 'noreply@autorepair.com',
      subject: `Service appointment tomorrow - ${reminder.customerName}`,
      html: mechanicReminderHtml,
      text: `Reminder: Service appointment tomorrow with ${reminder.customerName} at ${reminder.scheduledDateTime.toLocaleString()}.`
    });

    return true;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return false;
  }
}

// Send cancellation notification
export async function sendCancellationNotification(
  customerEmail: string,
  mechanicEmail: string,
  customerName: string,
  mechanicName: string,
  serviceType: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<boolean> {
  try {
    // Customer cancellation confirmation
    await sendEmail({
      to: customerEmail,
      from: 'noreply@autorepair.com',
      subject: `Appointment Cancelled - ${serviceType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${customerName},</p>
          <p>Your ${serviceType} appointment scheduled for ${new Date(scheduledDate + 'T' + scheduledTime).toLocaleString()} has been cancelled.</p>
          <p>You can schedule a new appointment anytime through our platform.</p>
          <p>Thank you for using our service.</p>
        </div>
      `,
      text: `Your ${serviceType} appointment for ${scheduledDate} at ${scheduledTime} has been cancelled.`
    });

    // Mechanic cancellation notification
    await sendEmail({
      to: mechanicEmail,
      from: 'noreply@autorepair.com',
      subject: `Appointment Cancelled - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${mechanicName},</p>
          <p>The ${serviceType} appointment with ${customerName} scheduled for ${new Date(scheduledDate + 'T' + scheduledTime).toLocaleString()} has been cancelled by the customer.</p>
          <p>This time slot is now available for other bookings.</p>
        </div>
      `,
      text: `Appointment with ${customerName} for ${scheduledDate} at ${scheduledTime} has been cancelled.`
    });

    return true;
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return false;
  }
}

// Schedule reminder system (would be called by a cron job)
export async function scheduleReminders(): Promise<void> {
  try {
    // In a real implementation, this would:
    // 1. Query database for appointments happening in 24 hours
    // 2. Check if reminders have already been sent
    // 3. Send reminders for pending appointments
    // 4. Mark reminders as sent to avoid duplicates
    
    console.log('Checking for appointments requiring reminders...');
    
    // This would be replaced with actual database queries
    // const upcomingAppointments = await storage.getAppointmentsIn24Hours();
    // for (const appointment of upcomingAppointments) {
    //   if (!appointment.reminderSent) {
    //     await sendAppointmentReminder(appointment);
    //     await storage.markReminderSent(appointment.id);
    //   }
    // }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
}