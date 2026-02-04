import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        // For development without email config, log to console
        return null;
    }
    
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

export async function sendContactEmail(data) {
    const transporter = createTransporter();
    
    const { name, email, company, subject, message } = data;
    
    const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from Structured For Growth contact form</em></p>
    `;
    
    const plainTextContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${company ? `Company: ${company}\n` : ''}
Subject: ${subject}

Message:
${message}

---
Sent from Structured For Growth contact form
    `;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@structuredforgrowth.com',
        to: process.env.EMAIL_TO || 'contact@structuredforgrowth.com',
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        text: plainTextContent,
        html: emailContent
    };
    
    if (!transporter) {
        // Development mode: just log the email
        console.log('📧 Email would be sent (development mode):');
        console.log(plainTextContent);
        return { success: true, dev: true };
    }
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}
