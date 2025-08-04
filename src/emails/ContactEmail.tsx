import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ContactEmailProps {
  name: string
  email: string
  message: string
  projectName?: string
  isProjectInquiry?: boolean
}

export default function ContactEmail({
  name,
  email,
  message,
  projectName,
  isProjectInquiry = false
}: ContactEmailProps) {
  const previewText = isProjectInquiry 
    ? `Projektanfrage von ${name} für ${projectName}`
    : `Neue Kontaktanfrage von ${name}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={h1}>NAMLA</Heading>
          </Section>
          
          <Section style={section}>
            <Heading style={h2}>
              {isProjectInquiry ? 'Neue Projektanfrage' : 'Neue Kontaktanfrage'}
            </Heading>
            
            {isProjectInquiry && projectName && (
              <Section style={projectBanner}>
                <Text style={projectText}>📍 Projekt: {projectName}</Text>
              </Section>
            )}
            
            <Section style={infoSection}>
              <Text style={label}>Name:</Text>
              <Text style={value}>{name}</Text>
              
              <Text style={label}>E-Mail:</Text>
              <Text style={value}>
                <Link href={`mailto:${email}`} style={emailLink}>
                  {email}
                </Link>
              </Text>
              
              <Text style={label}>Nachricht:</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              Gesendet über das Kontaktformular der NAMLA Website
              <br />
              <Link href="https://namla.de" style={footerLink}>
                namla.de
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#d97706', // amber-600
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const section = {
  padding: '0 40px',
}

const h2 = {
  color: '#1c1917', // stone-800
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
}

const projectBanner = {
  backgroundColor: '#fef3c7', // amber-100
  padding: '16px',
  borderRadius: '8px',
  margin: '0 0 24px 0',
}

const projectText = {
  color: '#92400e', // amber-800
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const infoSection = {
  margin: '24px 0',
}

const label = {
  color: '#57534e', // stone-600
  fontSize: '14px',
  fontWeight: '600',
  margin: '16px 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const value = {
  color: '#1c1917', // stone-800
  fontSize: '16px',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
}

const messageText = {
  color: '#1c1917', // stone-800
  fontSize: '16px',
  margin: '0 0 16px 0',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
}

const emailLink = {
  color: '#d97706', // amber-600
  textDecoration: 'underline',
}

const footer = {
  padding: '32px 40px',
  borderTop: '1px solid #e7e5e4', // stone-200
}

const footerText = {
  color: '#78716c', // stone-500
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0',
}

const footerLink = {
  color: '#d97706', // amber-600
  textDecoration: 'underline',
}