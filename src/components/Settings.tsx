import {
  Box,
  Card,
  Typography,
  Popover,
  Hidden,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Avatar,
  Tooltip,
  Chip,
  Link,
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import { useTranslation } from "react-i18next";
import Identicon from "identicon.js";
import { sha256 } from "js-sha256";
import { SettingsContainer } from "../containers/settings";
import {
  Menu as MenuIcon,
  Translate,
  ImagePlus,
  Github,
  ThemeLightDark,
  Cloud,
  CloudOutline,
} from "mdi-material-ui";
import { CloudContainer } from "../containers/cloud";
import { smmsUploadImages } from "../utilities/image_uploader";
import {
  useGitHubUserQuery,
  useUnlinkGitHubAccountMutation,
} from "../generated/graphql";
import { startGitHubOAuth } from "../utilities/utils";
import GitCommit from "../_git_commit";
import { themeManager } from "../themes/manager";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    settingsCard: {
      padding: theme.spacing(2),
      width: "600px",
      maxWidth: "100%",
      position: "relative",
      margin: `${theme.spacing(4)}px auto`,
      height: "fit-content",
      [theme.breakpoints.down("sm")]: {
        top: "0",
        margin: "0",
        height: "100%",
        overflow: "auto",
      },
    },
    cover: {
      position: "relative",
      width: "100%",
      height: "0",
      marginTop: theme.spacing(2),
      paddingTop: "30%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: "#fade79",
      [theme.breakpoints.down("sm")]: {
        paddingTop: "50%",
      },
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    loggedInSection: {
      position: "relative",
      padding: theme.spacing(0, 2),
      border: `1px solid ${theme.palette.primary.light}`,
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(2),
      borderRadius: "4px",
    },
    avatar: {
      marginTop: theme.spacing(2),
      width: "64px",
      height: "64px",
      borderRadius: "4px",
    },
    saveBtn: {
      marginBottom: theme.spacing(2),
    },
    logoutBtn: {
      position: "absolute",
      top: "16px",
      right: "16px",
    },
    section: {
      marginTop: theme.spacing(1),
    },
    swatch: {
      padding: "4px",
      backgroundColor: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
      display: "inline-block",
      cursor: "pointer",
    },
    color: {
      width: "36px",
      height: "18px",
      borderRadius: "2px",
    },
    editorText: {
      marginLeft: theme.spacing(4),
    },
    editorCursor: {
      borderLeftStyle: "solid",
      borderLeftWidth: "2px",
      padding: "0",
      position: "relative",
    },
    iconBtnSVG: {
      color: theme.palette.text.secondary,
    },
  }),
);

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function getRGBA(inputStr: string = ""): RGBA {
  if (!inputStr || !inputStr.length || !inputStr.match(/^rgba\(/)) {
    return {
      r: 51,
      g: 51,
      b: 51,
      a: 1,
    };
  } else {
    const match = inputStr.match(
      /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
    );
    if (!match) {
      return {
        r: 51,
        g: 51,
        b: 51,
        a: 1,
      };
    } else {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: parseInt(match[4], 10),
      };
    }
  }
}

interface Props {
  toggleDrawer: () => void;
}
export function Settings(props: Props) {
  const classes = useStyles(props);
  const { t } = useTranslation();
  const [colorPickerAnchorElement, setColorPickerAnchorElement] = useState<
    HTMLElement
  >(null);
  const [imageUploaderElement, setImageUploaderElement] = useState<
    HTMLInputElement
  >(null);
  const displayColorPicker = Boolean(colorPickerAnchorElement);
  const settingsContainer = SettingsContainer.useContainer();
  const cloudContainer = CloudContainer.useContainer();
  const [avatar, setAvatar] = useState<string>(
    (cloudContainer.viewer && cloudContainer.viewer.avatar) || "",
  );
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [resGitHubUser] = useGitHubUserQuery();
  const [
    resUnlinkGitHubAccount,
    executeUnlinkGitHubAccount,
  ] = useUnlinkGitHubAccountMutation();

  function uploadAvatar(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (!imageUploaderElement) return;
    imageUploaderElement.onchange = function (event) {
      const target = event.target as any;
      const files = target.files || [];
      new Noty({
        type: "info",
        text: "Uploading avatar image",
        layout: "topRight",
        theme: "relax",
        timeout: 2000,
      }).show();
      smmsUploadImages(files)
        .then((urls) => {
          setUploadingAvatar(false);
          setAvatar(urls[0] || "");
        })
        .catch((error: any) => {
          // console.log(error);
          new Noty({
            type: "error",
            text: "Failed to upload image",
            layout: "topRight",
            theme: "relax",
            timeout: 2000,
          }).show();
          setUploadingAvatar(false);
        });
    };
    setUploadingAvatar(true);
    imageUploaderElement.click();
  }

  useEffect(() => {
    if (cloudContainer.viewer) {
      setAvatar((avatar) => avatar || cloudContainer.viewer.avatar);
    }
  }, [cloudContainer.viewer]);

  useEffect(() => {
    if (resUnlinkGitHubAccount.data) {
      window.location.reload();
    }
  }, [resUnlinkGitHubAccount]);

  return (
    <Card className={clsx(classes.settingsCard)}>
      <Box
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Hidden smUp implementation="css">
          <IconButton onClick={props.toggleDrawer}>
            <MenuIcon className={clsx(classes.iconBtnSVG)}></MenuIcon>
          </IconButton>
        </Hidden>
        <Typography variant={"h6"}>{t("general/Settings")}</Typography>
      </Box>
      {cloudContainer.loggedIn ? (
        <Box className={clsx(classes.loggedInSection)}>
          <Box className={clsx(classes.section)}>
            <Box className={clsx(classes.row)}>
              <img
                src="/logo.svg"
                style={{ width: "48px", height: "48px" }}
                alt={"Crossnote"}
              ></img>
              <Typography variant={"h6"}>
                @{cloudContainer.viewer.username}
              </Typography>
            </Box>
            <Typography>{cloudContainer.viewer.email}</Typography>
            <Typography variant={"caption"}>
              {t("settings/created-cloud-widgets-count") +
                `: ${cloudContainer.viewer.widgetsCount}/∞`}
            </Typography>
          </Box>
          <Box className={clsx(classes.section)}>
            <Avatar
              className={clsx(classes.avatar)}
              variant={"rounded"}
              src={
                avatar ||
                "data:image/png;base64," +
                  new Identicon(
                    sha256(
                      cloudContainer.viewer && cloudContainer.viewer.username,
                    ),
                    80,
                  ).toString()
              }
            ></Avatar>
            <Box className={clsx(classes.row)}>
              <TextField
                label={t("settings/Avatar")}
                style={{ marginTop: 8 }}
                placeholder="https://.../xxx.png"
                helperText={t("settings/enter-avatar-image-url")}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={avatar}
                onChange={(event) => setAvatar(event.currentTarget.value)}
              />
              <Tooltip title={t("settings/upload-image")}>
                <IconButton disabled={uploadingAvatar} onClick={uploadAvatar}>
                  <ImagePlus className={clsx(classes.iconBtnSVG)}></ImagePlus>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box
            className={clsx(classes.section)}
            style={{ marginBottom: "16px" }}
          >
            {resGitHubUser.data &&
            resGitHubUser.data.viewer &&
            resGitHubUser.data.viewer.githubUser ? (
              <Chip
                color={"primary"}
                avatar={
                  <Avatar
                    src={resGitHubUser.data.viewer.githubUser.avatar}
                  ></Avatar>
                }
                label={
                  t("settings/linked-with-github-account") +
                  ": " +
                  resGitHubUser.data.viewer.githubUser.login
                }
                onClick={() => {
                  window.open(
                    "https://github.com/" +
                      resGitHubUser.data.viewer.githubUser.login,
                    "_blank",
                  );
                }}
                disabled={resUnlinkGitHubAccount.fetching}
                onDelete={() => {
                  executeUnlinkGitHubAccount();
                }}
              />
            ) : (
              <Chip
                color={"default"}
                disabled={resGitHubUser.fetching}
                icon={<Github></Github>}
                onClick={() => startGitHubOAuth()}
                label={t("settings/link-with-github-account")}
              ></Chip>
            )}
          </Box>
          <Box className={clsx(classes.section)}>
            <Button
              variant={"contained"}
              color={"primary"}
              className={clsx(classes.saveBtn)}
              onClick={() => {
                cloudContainer.setUserInfo({
                  name: settingsContainer.authorName,
                  cover: "",
                  avatar,
                  editorCursorColor: settingsContainer.editorCursorColor,
                  language: settingsContainer.language,
                });
              }}
              disabled={cloudContainer.resSetUserInfo.fetching}
            >
              {t("general/upload-the-profile")}
            </Button>
          </Box>
          <Button
            variant={"outlined"}
            color="secondary"
            className={clsx(classes.logoutBtn)}
            onClick={() => {
              cloudContainer.logout();
            }}
          >
            {t("settings/log-out")}
          </Button>
        </Box>
      ) : null}
      <Box className={clsx(classes.section)}>
        <Typography
          variant={"body2"}
          style={{
            // color: "rgba(0, 0, 0, 0.54)",
            fontSize: "0.75rem",
            marginBottom: "6px",
          }}
        >
          <Translate style={{ marginRight: "8px" }}></Translate>
          {"Languages/语言"}
        </Typography>
        <Select
          variant={"standard"}
          value={settingsContainer.language}
          onChange={(event) =>
            settingsContainer.setLanguage(event.target.value as string)
          }
        >
          <MenuItem value={"en-US"}>English</MenuItem>
          <MenuItem value={"zh-CN"}>简体中文</MenuItem>
          <MenuItem value={"zh-TW"}>繁体中文</MenuItem>
          <MenuItem value={"ja-JP"}>日本語</MenuItem>
        </Select>
      </Box>
      <Box className={clsx(classes.section)}>
        <TextField
          label={t("settings/author-name")}
          placeholder={t("account/Anonymous")}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          value={settingsContainer.authorName}
          onChange={(event) =>
            settingsContainer.setAuthorName(event.currentTarget.value)
          }
        ></TextField>
      </Box>
      <Box className={clsx(classes.section)}>
        <TextField
          label={t("settings/author-email")}
          placeholder={"anonymous@crossnote.app"}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          value={settingsContainer.authorEmail}
          onChange={(event) =>
            settingsContainer.setAuthorEmail(event.currentTarget.value)
          }
        ></TextField>
      </Box>
      <Box className={clsx(classes.section)}>
        <Typography
          variant={"body2"}
          style={{
            // color: "rgba(0, 0, 0, 0.54)",
            fontSize: "0.75rem",
            marginBottom: "6px",
            marginTop: "16px",
          }}
        >
          <ThemeLightDark style={{ marginRight: "8px" }}></ThemeLightDark>
          {t("settings/theme") + " (beta)"}
        </Typography>
        <Select
          value={settingsContainer.theme.name}
          onChange={(event) => {
            settingsContainer.setTheme(event.target.value as string);
          }}
        >
          {themeManager.themes.map((theme) => {
            return (
              <MenuItem key={theme.name} value={theme.name}>
                {theme.name}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Box className={clsx(classes.section)}>
        <Typography
          variant={"body2"}
          style={{
            fontSize: "0.75rem",
            marginBottom: "6px",
            marginTop: "16px",
          }}
        >
          {t("settings/editor-cursor-color")}
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Box
            className={clsx(classes.swatch)}
            onClick={(event: React.MouseEvent<HTMLElement>) =>
              setColorPickerAnchorElement(event.currentTarget)
            }
          >
            <Box
              className={clsx(classes.color)}
              style={{ backgroundColor: settingsContainer.editorCursorColor }}
            ></Box>
          </Box>
          <div className={clsx(classes.editorText)}>
            {t("settings/hello")}
            <span
              className={clsx(classes.editorCursor)}
              style={{
                borderLeftColor:
                  settingsContainer.editorCursorColor || "#4A90E2",
              }}
            ></span>
            {t("settings/world")}
          </div>
        </Box>
        <Popover
          open={displayColorPicker}
          anchorEl={colorPickerAnchorElement}
          onClose={() => {
            setColorPickerAnchorElement(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <SketchPicker
            color={getRGBA(settingsContainer.editorCursorColor)}
            onChange={(color) => {
              const cursorColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
              settingsContainer.setEditorCursorColor(cursorColor);
            }}
          ></SketchPicker>
        </Popover>
      </Box>
      <Box className={clsx(classes.section)} style={{ marginTop: "32px" }}>
        <Link
          href={
            "https://crossnote.app/?repo=https%3A%2F%2Fgithub.com%2F0xGG%2Fwelcome-notebook&branch=master&filePath=README.md"
          }
          target={"_blank"}
        >
          <Typography variant={"caption"}>
            {"🤔 " + t("settings/about-this-project")}
          </Typography>
        </Link>
        <br></br>
        <Link
          href={`https://github.com/0xGG/crossnote/commit/${
            GitCommit.logMessage.split(/\s+/)[0]
          }`}
          target={"_blank"}
        >
          <Typography variant={"caption"}>
            {"🛠 build " + GitCommit.logMessage}
          </Typography>
        </Link>
      </Box>
      {!cloudContainer.loggedIn && (
        <Button
          variant={"outlined"}
          color={"primary"}
          className={clsx(classes.logoutBtn)}
          onClick={() => cloudContainer.setAuthDialogOpen(true)}
        >
          {t("general/sign-in")}
        </Button>
      )}
      <input
        type="file"
        multiple
        style={{ display: "none" }}
        ref={(element: HTMLInputElement) => {
          setImageUploaderElement(element);
        }}
      ></input>
    </Card>
  );
}
