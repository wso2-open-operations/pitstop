// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import {
  Box,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Popover,
  ListItem,
  ListItemText,
  List,
  ListItemButton,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import CloseIcon from "@mui/icons-material/Close";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import { CustomStylingInfo } from "../../types/types";
import { useState } from "react";

interface StylePickerProps {
  defaultStyleConfigs?: CustomStylingInfo;
  setDefaultStyleConfigs: (newValue: CustomStylingInfo) => void;
  handleCancel: () => void;
  type: "page" | "content" | "section";
}

const StylePicker = ({ defaultStyleConfigs, setDefaultStyleConfigs, type, handleCancel }: StylePickerProps) => {
  const [fontColorAnchorEl, setFontColorAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [colorFillAnchorEl, setColorFillAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [fontSizeAnchorEl, setFontSizeAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [fontFamilyAnchorEl, setFontFamilyAnchorEl] = useState<HTMLButtonElement | null>(null);
  const theme = useTheme();

  const boldTextHandler = () => {
    setDefaultStyleConfigs({
      ...defaultStyleConfigs,
      fontWeight: defaultStyleConfigs?.fontWeight === "bolder" ? "normal" : "bolder",
    });
  };

  const italicTextHandler = () => {
    setDefaultStyleConfigs({
      ...defaultStyleConfigs,
      fontStyle: defaultStyleConfigs?.fontStyle === "italic" ? "initial" : "italic",
    });
  };

  const fontColorHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFontColorAnchorEl(event.currentTarget);
  };

  const colorFillHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorFillAnchorEl(event.currentTarget);
  };

  const fontSizeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFontSizeAnchorEl(event.currentTarget);
  };
  const fontFamilyHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFontFamilyAnchorEl(event.currentTarget);
  };

  const actions = [
    {
      icon: <FormatBoldIcon fontSize="small" />,
      name: "bold",
      action: boldTextHandler,
      initialStyleConfigs: defaultStyleConfigs?.fontWeight,
    },
    {
      icon: <FormatItalicIcon fontSize="small" />,
      name: "italic",
      action: italicTextHandler,
      initialStyleConfigs: defaultStyleConfigs?.fontStyle,
    },
    {
      icon: <FormatColorTextIcon fontSize="small" sx={{ color: defaultStyleConfigs?.color }} />,
      name: "color",
      action: fontColorHandler,
      type: "color",
      anchorEl: fontColorAnchorEl,
      setAnchorEl: setFontColorAnchorEl,
      initialStyleConfigs: defaultStyleConfigs?.color,
    },
    {
      icon: <FormatColorFillIcon fontSize="small" sx={{ color: defaultStyleConfigs?.background }} />,
      name: "background",
      action: colorFillHandler,
      type: "color",
      anchorEl: colorFillAnchorEl,
      setAnchorEl: setColorFillAnchorEl,
      initialStyleConfigs: defaultStyleConfigs?.background,
    },
    {
      icon: <FormatSizeIcon fontSize="small" />,
      name: "fontSize",
      action: fontSizeHandler,
      type: "number",
      anchorEl: fontSizeAnchorEl,
      setAnchorEl: setFontSizeAnchorEl,
      initialStyleConfigs: defaultStyleConfigs?.fontSize,
    },
    {
      icon: <TextFormatIcon fontSize="small" />,
      name: "fontFamily",
      action: fontFamilyHandler,
      type: "menu",
      anchorEl: fontFamilyAnchorEl,
      setAnchorEl: setFontFamilyAnchorEl,
      initialStyleConfigs: defaultStyleConfigs?.fontFamily,
    },
  ];

  return (
    <Stack
      flexDirection={"column"}
      gap={1}
      sx={{
        position: "absolute",
        ...(type === "section" || type === "page" ? { top: -35, right: 0 } : { bottom: -33, right: -60 }),
      }}
    >
      <Stack flexDirection={"row"} gap={2}>
        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          sx={{
            border: "1px solid",
            zIndex: 1,
            borderColor: "divider",
            borderRadius: 2,
            paddingX: 0,
            bgcolor: "background.paper",
            color: "text.secondary",
          }}
        >
          {actions.map((action, idx) => (
            <>
              <Tooltip title={action.name} arrow sx={{ zIndex: 1000 }}>
                <IconButton
                  size="small"
                  sx={{
                    borderRadius: 0,
                    paddingX: 0.6,
                    ...((idx === 0 || idx === actions.length - 1) && {
                      borderRadius: 2,
                    }),
                  }}
                  onClick={(event) => action.action(event)}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" variant="middle" flexItem />
              {action.type === "color" && action.anchorEl && action.setAnchorEl && (
                  <Popover
                    open={Boolean(action.anchorEl)}
                    anchorEl={action.anchorEl}
                    onClose={() => action.setAnchorEl(null)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <input
                        type="color"
                        name={action.name}
                        value={action.initialStyleConfigs}
                        onChange={(e) => {
                          setDefaultStyleConfigs({
                            ...defaultStyleConfigs,
                            [action.name]: e.target.value,
                          });

                          console.log({
                            ...defaultStyleConfigs,
                            [action.name]: e.target.value,
                          });
                        }}
                      />
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => {
                          if (action.name == "color") {
                            setDefaultStyleConfigs({
                              ...defaultStyleConfigs,
                              color: theme.palette.primary.main,
                            });
                          } else if (action.name == "background") {
                              if(defaultStyleConfigs?.background) {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { background: _, ...rest } = defaultStyleConfigs;
                                setDefaultStyleConfigs(rest);
                              }
                          }
                        }}
                      >
                        <Tooltip title="Reset Color" arrow>
                          <Typography>Reset</Typography>
                        </Tooltip>
                      </Button>
                    </Box>
                  </Popover>
                )}

              {action.type === "number" && action.anchorEl && action.setAnchorEl && (
                  <Popover
                    open={Boolean(action.anchorEl)}
                    anchorEl={action.anchorEl}
                    onClose={() => action.setAnchorEl(null)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <List
                      sx={{
                        zIndex: 5,
                        p: 0,
                        bgcolor: "background.paper",
                      }}
                    >
                      {[10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value, idx) => (
                          <ListItem key={idx} sx={{ p: 0, m: 0 }} value={value}>
                            <ListItemButton
                              sx={{ p: 1, m: 0 }}
                              onClick={() => {
                                setDefaultStyleConfigs({
                                  ...defaultStyleConfigs,
                                  [action.name]: value,
                                });
                                action.setAnchorEl(null);
                              }}
                            >
                              <ListItemText primary={`${value}`} sx={{ p: 0, m: 0 }} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                    </List>
                  </Popover>
                )}

              {action.type === "menu" && action.anchorEl && action.setAnchorEl && (
                  <Popover
                    open={Boolean(action.anchorEl)}
                    anchorEl={action.anchorEl}
                    onClose={() => action.setAnchorEl(null)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <List
                      sx={{
                        zIndex: 5,
                        bgcolor: "background.paper",
                      }}
                    >
                      {["Arial", "Times New Roman", "Courier New", "Ruda"].map((font, idx) => (
                          <ListItem key={idx} sx={{ p: 0, m: 0, bgcolor: "background.paper" }}>
                            <ListItemButton
                              sx={{ p: 1, m: 0 }}
                              onClick={() => {
                                setDefaultStyleConfigs({
                                  ...defaultStyleConfigs,
                                  [action.name]: font,
                                });
                                action.setAnchorEl(null);
                              }}
                            >
                              <ListItemText primary={font} sx={{ p: 0, m: 0 }} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                    </List>
                  </Popover>
                )}
            </>
          ))}
        </Stack>
        <Stack flexDirection={"row"} alignItems={"center"} gap={1}>
          <IconButton
            sx={{
              border: "1px solid",
              zIndex: 1,
              borderColor: (theme) => theme.palette.error.main,
              borderRadius: 2,
              p: 0.1,
              bgcolor: "background.paper",
            }}
            onClick={handleCancel}
          >
            <CloseIcon fontSize="small" color="error" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default StylePicker;
