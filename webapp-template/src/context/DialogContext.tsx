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

import { TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { JSX, useContext, useState } from "react";

type InputObj = {
  label: string;
  mandatory: boolean;
  type: "textarea" | "date";
};

interface UseConfirmationDialogShowReturnType {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  onHide: () => void;
}

const useDialogShow = (): UseConfirmationDialogShowReturnType => {
  const [showDialog, setShowDialog] = useState(false);

  const handleOnHide = () => {
    setShowDialog(false);
  };

  return {
    showDialog,
    setShowDialog,
    onHide: handleOnHide,
  };
};

type ConfirmationDialogContextType = {
  showConfirmation: (
    title: string,
    message: string | JSX.Element,
    action: () => void,
    okText?: string,
    cancelText?: string,
    inputObj?: InputObj
  ) => void;
};

type ConfirmationModalContextProviderProps = {
  children: React.ReactNode;
};

const ConfirmationModalContext = React.createContext<ConfirmationDialogContextType>(
  {} as ConfirmationDialogContextType
);

const ConfirmationDialogContextProvider: React.FC<ConfirmationModalContextProviderProps> = (props) => {
  const { setShowDialog, showDialog, onHide } = useDialogShow();

  const [comment, setComment] = React.useState("");

  const [content, setContent] = useState<{
    title: string;
    message: string | JSX.Element;
    action: (value?: string) => void;
    okText?: string;
    cancelText?: string;
    inputObj?: InputObj;
  } | null>();

  const handleShow = (
    title: string,
    message: string | JSX.Element,
    action: (value?: string) => void,
    okText?: string,
    cancelText?: string,
    inputObj?: InputObj
  ) => {
    setContent({
      title,
      message,
      action,
      okText,
      cancelText,
      inputObj,
    });
    setShowDialog(true);
  };

  const dialogContext: ConfirmationDialogContextType = {
    showConfirmation: handleShow,
  };

  const handleOk = (value?: string) => {
    if (content) {
      content.action(value);
    }
    Reset();
    onHide();
  };

  const handleCancel = () => {
    Reset();
    onHide();
  };

  const Reset = () => {
    setContent({
      title: "",
      message: "",
      action: () => {},
      okText: undefined,
      cancelText: undefined,
    });

    setComment("");
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ConfirmationModalContext.Provider value={dialogContext}>
        {props.children}
        {content && (
          <Dialog
            style={{ padding: 10, boxShadow: "none" }}
            open={showDialog}
            onClose={onHide}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" className="dialogtitle" fontSize={"16px"}>
              {content.title}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" className="dialog-body" fontSize={"14px"}>
                {content.message}
              </DialogContentText>
              {content.inputObj && (
                <div style={{ paddingTop: "20px" }}>
                  {content.inputObj.type === "textarea" && (
                    <>
                      <TextField
                        fullWidth
                        value={comment}
                        label={content.inputObj?.label}
                        multiline
                        inputProps={{ maxLength: 250 }}
                        maxRows={6}
                        onChange={onChange}
                      />
                      <Typography variant="h6" color="gray" sx={{ mt: 1 }}>
                        {comment.length}/250{" "}
                      </Typography>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: 10,
                marginTop: 0,
              }}
            >
              <Button onClick={handleCancel} className="dialogno" size="large">
                {content.cancelText ? content.cancelText : "No"}
              </Button>
              <Button
                disabled={content.inputObj?.mandatory && comment === ""}
                onClick={() => (content.inputObj ? handleOk(comment) : handleOk())}
                autoFocus
                className="dialogyes"
                size="large"
              >
                {content.okText ? content.okText : "Yes"}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </ConfirmationModalContext.Provider>
    </LocalizationProvider>
  );
};

const useConfirmationModalContext = (): ConfirmationDialogContextType => useContext(ConfirmationModalContext);

// eslint-disable-next-line react-refresh/only-export-components
export { useDialogShow, useConfirmationModalContext };

export default ConfirmationDialogContextProvider;
