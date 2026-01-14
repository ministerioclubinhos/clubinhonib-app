import React from "react";
import { Stack, Avatar, Badge, Box, Typography } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export function SectionHeader({ context, title, subtitle }: { context: "clubs" | "children" | "pagelas"; title: string; subtitle?: string; }) {
const icon = context === "clubs" ? <PeopleAltIcon /> : context === "children" ? <PersonIcon /> : <EventAvailableIcon />;
return (
<Stack direction="row" alignItems="center" spacing={1}>
<Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<WbSunnyIcon fontSize="inherit" />}>
<Avatar>{icon}</Avatar>
</Badge>
<Box>
<Typography variant="subtitle2" color="text.secondary">{subtitle}</Typography>
<Typography variant="h6">{title}</Typography>
</Box>
</Stack>
);
}