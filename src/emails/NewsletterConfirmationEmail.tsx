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

interface NewsletterConfirmationEmailProps {
  name?: string
  confirmationUrl: string
}

export default function NewsletterConfirmationEmail({
  name,
  confirmationUrl
}: NewsletterConfirmationEmailProps) {
  const displayName = name || 'Liebe Interessentin, lieber Interessent'

  return (
    <Html>
      <Head />
      <Preview>Bestätigen Sie Ihre Newsletter-Anmeldung bei NAMLA</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={h1}>NAMLA</Heading>
            <Text style={tagline}>Ihr Partner für hochwertige Wohnimmobilien</Text>
          </Section>
          
          <Section style={section}>
            <Heading style={h2}>Newsletter-Anmeldung bestätigen</Heading>
            
            <Text style={text}>
              Hallo {name ? name : 'und herzlich willkommen'},
            </Text>
            
            <Text style={text}>
              vielen Dank für Ihr Interesse an unserem Newsletter! Um Ihre Anmeldung 
              abzuschließen und sicherzustellen, dass Sie alle wichtigen Updates zu 
              unseren Wohnimmobilienprojekten erhalten, klicken Sie bitte auf den 
              folgenden Button:
            </Text>
            
            <Section style={buttonSection}>
              <Button style={button} href={confirmationUrl}>
                Newsletter-Anmeldung bestätigen
              </Button>
            </Section>
            
            <Text style={text}>
              Falls der Button nicht funktioniert, können Sie auch diesen Link 
              in Ihren Browser kopieren:
            </Text>
            
            <Text style={linkText}>
              <Link href={confirmationUrl} style={link}>
                {confirmationUrl}
              </Link>
            </Text>
            
            <Text style={text}>
              Nach der Bestätigung erhalten Sie regelmäßig Informationen zu:
            </Text>
            
            <Text style={listItem}>• Neuen Wohnimmobilienprojekten in der Region Ulm</Text>
            <Text style={listItem}>• Baufortschritten und Verfügbarkeiten</Text>
            <Text style={listItem}>• Exklusiven Vorab-Informationen für Interessenten</Text>
            <Text style={listItem}>• Einladungen zu Besichtigungsterminen</Text>
            
            <Text style={smallText}>
              Diese E-Mail wurde an Sie gesendet, weil Sie sich auf unserer Website 
              für den Newsletter angemeldet haben. Falls Sie diese E-Mail irrtümlich 
              erhalten haben, können Sie sie einfach ignorieren.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              <strong>NAMLA GmbH</strong><br />
              Zeitblomstr. 31/2<br />
              89073 Ulm<br />
              <Link href="mailto:info@namla.de" style={footerLink}>
                info@namla.de
              </Link>
              {' | '}
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

const linkText = {
  color: '#78716c', // stone-500
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 24px 0',
  wordBreak: 'break-all' as const,
}

const link = {
  color: '#d97706', // amber-600
  textDecoration: 'underline',
}

const listItem = {
  color: '#44403c', // stone-700
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const smallText = {
  color: '#78716c', // stone-500
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0 0',
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