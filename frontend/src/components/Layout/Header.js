import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  User,
  Calendar,
  FileText,
  Pill,
  MapPin,
  Stethoscope,
  LogOut,
  Home,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";

const Header = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { availableLanguages, currentLanguage, changeLanguage } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

  const navigationItems = [
    { path: "/", label: t("navigation.home"), icon: Home, public: true },
    {
      path: "/dashboard",
      label: t("navigation.dashboard"),
      icon: User,
      protected: true,
    },
    {
      path: "/appointments",
      label: t("navigation.appointments"),
      icon: Calendar,
      protected: true,
    },
    {
      path: "/health-records",
      label: t("navigation.healthRecords"),
      icon: FileText,
      protected: true,
    },
    {
      path: "/medicines",
      label: t("navigation.medicines"),
      icon: Pill,
      public: true,
    },
    {
      path: "/pharmacies",
      label: t("navigation.pharmacies"),
      icon: MapPin,
      public: true,
    },
    {
      path: "/symptom-checker",
      label: t("navigation.symptomChecker"),
      icon: Stethoscope,
      public: true,
    },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    handleProfileMenuClose();
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleLanguageMenuClose();
  };

  const visibleNavItems = navigationItems.filter(
    (item) => item.public || (item.protected && user)
  );

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
    >
      <Box sx={{ width: 280, pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, mb: 2, color: "primary.main" }}>
          Nabha Healthcare
        </Typography>

        <List>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={handleMobileMenuToggle}
                >
                  <ListItemIcon>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogOut size={20} />
                  </ListItemIcon>
                  <ListItemText primary={t("auth.logout")} />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 600,
              mr: 4,
            }}
          >
            Nabha Healthcare
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              {visibleNavItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{ color: "text.primary" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Language selector */}
          <Button
            onClick={handleLanguageMenuOpen}
            endIcon={<ChevronDown size={16} />}
            sx={{ mr: 1, minWidth: "auto", color: "text.secondary" }}
          >
            {
              availableLanguages.find((lang) => lang.code === currentLanguage)
                ?.native
            }
          </Button>

          {/* Auth section */}
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="small"
              >
                {t("auth.login")}
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="small"
              >
                {t("auth.register")}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      {mobileDrawer}

      {/* Profile menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          component={RouterLink}
          to="/profile"
          onClick={handleProfileMenuClose}
        >
          <User size={16} style={{ marginRight: 8 }} />
          {t("navigation.profile")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          {t("auth.logout")}
        </MenuItem>
      </Menu>

      {/* Language menu */}
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
          >
            {language.native}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Header;
