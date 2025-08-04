import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ProjectInterestConfirmationEmailProps {
  name: string
  projectName: string
  projectLocation?: string
  projectStatus?: string
}

export default function ProjectInterestConfirmationEmail({
  name,
  projectName,
  projectLocation,
  projectStatus
}: ProjectInterestConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Vielen Dank für Ihr Interesse an {projectName} - NAMLA</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={h1}>NAMLA</Heading>
            <Text style={tagline}>Ihr Partner für hochwertige Wohnimmobilien</Text>
          </Section>
          
          <Section style={section}>
            <Heading style={h2}>Vielen Dank für Ihr Interesse!</Heading>
            
            <Text style={text}>
              Hallo {name},
            </Text>
            
            <Text style={text}>
              vielen Dank für Ihr Interesse an unserem Projekt <strong>{projectName}</strong>
              {projectLocation && ` in ${projectLocation}`}. Wir haben Ihre Anfrage erhalten 
              und werden uns zeitnah bei Ihnen melden.
            </Text>
            
            <Section style={projectBox}>
              <Text style={projectTitle}>📍 Ihr angefragtes Projekt</Text>
              <Text style={projectDetail}>
                <strong>Projekt:</strong> {projectName}
              </Text>
              {projectLocation && (
                <Text style={projectDetail}>
                  <strong>Standort:</strong> {projectLocation}
                </Text>
              )}
              {projectStatus && (
                <Text style={projectDetail}>
                  <strong>Status:</strong> {projectStatus}
                </Text>
              )}
            </Section>
            
            <Text style={text}>
              <strong>Wie geht es weiter?</strong>
            </Text>
            
            <Text style={listItem}>• Wir prüfen Ihre Anfrage und bereiten relevante Informationen vor</Text>
            <Text style={listItem}>• Ein Mitarbeiter unseres Teams wird sich in den nächsten 1-2 Werktagen bei Ihnen melden</Text>
            <Text style={listItem}>• Gerne vereinbaren wir auch einen persönlichen Beratungstermin</Text>
            <Text style={listItem}>• Bei verfügbaren Einheiten organisieren wir eine Besichtigung</Text>
            
            <Text style={text}>
              <strong>Haben Sie noch Fragen?</strong><br />
              Sie erreichen uns jederzeit unter:
            </Text>
            
            <Text style={contactInfo}>
              <strong>NAMLA GmbH</strong><br />
              Zeitblomstr. 31/2, 89073 Ulm<br />
              <Link href="mailto:info@namla.de" style={link}>info@namla.de</Link><br />
              <Link href="https://namla.de" style={link}>namla.de</Link>
            </Text>
            
            <Text style={text}>
              Wir freuen uns darauf, Sie bei der Realisierung Ihres Wohntraums 
              begleiten zu dürfen!
            </Text>
            
            <Text style={signature}>
              Ihr NAMLA Team
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              Diese E-Mail wurde automatisch generiert, da Sie Interesse an einem 
              unserer Wohnimmobilienprojekte bekundet haben.
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
  maxWidth: '600px',
}

const logoSection = {
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#d97706', // amber-600
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const tagline = {
  color: '#78716c', // stone-500
  fontSize: '14px',
  margin: '8px 0 0 0',
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

const text = {
  color: '#44403c', // stone-700
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const projectBox = {
  backgroundColor: '#fef3c7', // amber-100
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const projectTitle = {
  color: '#92400e', // amber-800
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const projectDetail = {
  color: '#92400e', // amber-800
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 4px 0',
}

const listItem = {
  color: '#44403c', // stone-700
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const contactInfo = {
  color: '#44403c', // stone-700
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
  backgroundColor: '#f5f5f4', // stone-100
  padding: '16px',
  borderRadius: '8px',
}

const link = {
  color: '#d97706', // amber-600
  textDecoration: 'underline',
}

const signature = {
  color: '#44403c', // stone-700
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0 0 0',
  fontStyle: 'italic',
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