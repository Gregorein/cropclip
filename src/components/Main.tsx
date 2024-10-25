import { Box } from "@mui/joy";
import { ReactNode } from "react";

const Main = ({ children }: { children: ReactNode }) => (
    <Box
        component="main"
        sx={(theme) => ({
            height: "100vh",
            width: "100vw",
            backgroundColor: theme.vars.palette.background.body,
            display: "flex",
            flexDirection: "column",
        })}
    >
        {children}
    </Box>
);

export default Main;
