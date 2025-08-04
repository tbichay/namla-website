import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface NewsletterWelcomeEmailProps {
  name?: string
  unsubscribeUrl: string
}

export default function NewsletterWelcomeEmail({
  name,
  unsubscribeUrl
}: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Willkommen beim NAMLA Newsletter - Ihr Partner für hochwertige Wohnimmobilien</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={h1}>NAMLA</Heading>
            <Text style={tagline}>Ihr Partner für hochwertige Wohnimmobilien</Text>
          </Section>
          
          <Section style={section}>
            <Heading style={h2}>Herzlich willkommen!</Heading>
            
            <Text style={text}>
              {name ? `Hallo ${name}` : 'Hallo'},
            </Text>
            
            <Text style={text}>
              vielen Dank für die Bestätigung Ihrer Newsletter-Anmeldung! Wir freuen uns, 
              Sie über unsere hochwertigen Wohnimmobilienprojekte in der Region Ulm 
              informieren zu dürfen.
            </Text>
            
            <Section style={highlightBox}>
              <Text style={highlightText}>
                <strong>Über 50 Jahre Bauerfahrung</strong><br />
                Seit 1974 realisieren wir als familiengeführtes Unternehmen 
                hochwertige Wohnprojekte mit bereits über 170 erfolgreich 
                fertiggestellten Wohneinheiten.
              </Text>
            </Section>
            
            <Text style={text}>
              <strong>Das erwartet Sie in unserem Newsletter:</strong>
            </Text>
            
            <Text style={listItem}>🏠 Exklusive Vorab-Informationen zu neuen Projekten</Text>
            <Text style={listItem}>📍 Updates zu Baufortschritten in der Region Ulm</Text>
            <Text style={listItem}>🔑 Verfügbarkeitsmeldungen für Wohneinheiten</Text>
            <Text style={listItem}>📅 Einladungen zu Besichtigungsterminen</Text>
            <Text style={listItem}>💡 Expertentipps rund um den Immobilienkauf</Text>
            
            <Text style={text}>
              Haben Sie aktuell Interesse an einem bestimmten Projekt oder möchten 
              Sie sich persönlich beraten lassen? Dann nehmen Sie gerne Kontakt 
              mit uns auf:
            </Text>
            
            <Section style={buttonSection}>
              <Button style={button} href="https://namla.de/kontakt">
                Jetzt Kontakt aufnehmen
              </Button>
            </Section>
            
            <Text style={text}>
              Wir freuen uns darauf, Sie über unsere aktuellen und zukünftigen 
              Projekte zu informieren!
            </Text>
            
            <Text style={signature}>
              Ihr NAMLA Team
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              <strong>NAMLA GmbH</strong><br />
              Zeitblomstr. 31/2, 89073 Ulm<br />
              <Link href="mailto:info@namla.de" style={footerLink}>
                info@namla.de
              </Link>
              {' | '}
              <Link href="https://namla.de" style={footerLink}>
                namla.de
              </Link>
            </Text>
            <Text style={unsubscribeText}>
              Sie können sich jederzeit{' '}
              <Link href={unsubscribeUrl} style={footerLink}>
                hier vom Newsletter abmelden
              </Link>
              .
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

const highlightBox = {
  backgroundColor: '#fef3c7', // amber-100
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const highlightText = {
  color: '#92400e', // amber-800
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
}

const listItem = {
  color: '#44403c', // stone-700
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#d97706', // amber-600
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
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
  margin: '0 0 12px 0',
}

const unsubscribeText = {
  color: '#78716c', // stone-500
  fontSize: '11px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0',
}

const footerLink = {
  color: '#d97706', // amber-600
  textDecoration: 'underline',
}