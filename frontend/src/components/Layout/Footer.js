import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Favorite,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: t("footer.services"),
      links: [
        { text: t("footer.telemedicine"), path: "/appointments" },
        { text: t("footer.symptomChecker"), path: "/symptom-checker" },
        { text: t("footer.healthRecords"), path: "/health-records" },
        { text: t("footer.medicineTracker"), path: "/medicines" },
      ],
    },
    {
      title: t("footer.quickLinks"),
      links: [
        { text: t("footer.aboutUs"), path: "/about" },
        { text: t("footer.doctors"), path: "/doctors" },
        { text: t("footer.contactUs"), path: "/contact" },
        { text: t("footer.support"), path: "/support" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { text: t("footer.privacyPolicy"), path: "/privacy" },
        { text: t("footer.termsOfService"), path: "/terms" },
        { text: t("footer.disclaimer"), path: "/disclaimer" },
        { text: t("footer.accessibility"), path: "/accessibility" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Phone sx={{ fontSize: 18 }} />,
      text: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: <Email sx={{ fontSize: 18 }} />,
      text: "support@nabhahealth.care",
      href: "mailto:support@nabhahealth.care",
    },
    {
      icon: <LocationOn sx={{ fontSize: 18 }} />,
      text: "Nabha, Patiala, Punjab, India",
      href: "https://maps.google.com/?q=Nabha,Punjab",
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, href: "#", label: "Facebook" },
    { icon: <Twitter />, href: "#", label: "Twitter" },
    { icon: <Instagram />, href: "#", label: "Instagram" },
    { icon: <LinkedIn />, href: "#", label: "LinkedIn" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "white",
        mt: "auto",
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={3}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              Nabha Healthcare
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              {t(
                "footer.brandDescription",
                "Bringing quality healthcare to rural communities through technology and compassion."
              )}
            </Typography>

            {/* Social Links */}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                {section.title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      "&:hover": {
                        color: "white",
                        textDecoration: "underline",
                      },
                      transition: "color 0.3s ease",
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Contact Information */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              {t("footer.contactInfo")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactInfo.map((contact, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {contact.icon}
                  </Box>
                  <Link
                    href={contact.href}
                    target={
                      contact.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      contact.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      "&:hover": {
                        color: "white",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {contact.text}
                  </Link>
                </Box>
              ))}
            </Box>

            {/* Emergency Contact */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                {t("footer.emergency")}
              </Typography>
              <Typography variant="h6" sx={{ color: "error.light" }}>
                108
              </Typography>
              <Typography variant="caption">
                {t("footer.emergencyNote", "24/7 Emergency Services")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "rgba(255,255,255,0.2)" }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Nabha Healthcare. {t("footer.allRightsReserved")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t("footer.madeWithLove", "Made with")}
            </Typography>
            <Favorite sx={{ fontSize: 16, color: "error.light" }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t("footer.forRuralHealth", "for rural health")}
            </Typography>
          </Box>
        </Box>

        {/* App Download Section */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
            {t(
              "footer.downloadApp",
              "Download our mobile app for better access"
            )}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Box
              component="img"
              src="/images/google-play-badge.png"
              alt="Get it on Google Play"
              sx={{
                height: 40,
                cursor: "pointer",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
                filter: "brightness(0) invert(1)",
              }}
            />
            <Box
              component="img"
              src="/images/app-store-badge.png"
              alt="Download on the App Store"
              sx={{
                height: 40,
                cursor: "pointer",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
                filter: "brightness(0) invert(1)",
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
