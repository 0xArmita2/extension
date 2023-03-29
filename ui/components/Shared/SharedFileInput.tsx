import React, { ChangeEvent, ReactElement, useCallback, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import SharedIcon from "./SharedIcon"

type Props = {
  onFileLoad: (fileReader: FileReader | null) => void
  disabled?: boolean
  fileTypeLabel: string
  style?: React.CSSProperties
}

export default function SharedFileInput(props: Props): ReactElement {
  const { t } = useTranslation("translation", {
    keyPrefix: "onboarding.tabbed.addWallet.importPrivateKey",
  })
  const { onFileLoad, disabled = false, fileTypeLabel, style } = props
  const [fileName, setFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = event.target?.files ?? []
      setErrorMessage("")

      if (!file) {
        return
      }

      const fileReader = new FileReader()
      setFileName(file.name)
      fileReader.readAsText(file, "UTF-8")
      fileReader.onloadstart = () => {
        setIsUploaded(false)
        setIsLoading(true)
        onFileLoad(null)
      }
      fileReader.onload = (e) => {
        setIsLoading(false)
        if (file.type && file.type !== "application/json") {
          setErrorMessage(
            t("wrongFile", {
              type: fileTypeLabel,
            })
          )
        } else {
          setIsUploaded(true)
          onFileLoad(e.target)
        }
      }
      fileReader.onerror = () => {
        setIsLoading(false)
        setErrorMessage(t("uploadFail"))
        onFileLoad(null)
      }
    },
    [onFileLoad, fileTypeLabel, t]
  )

  const hasStatus = errorMessage || isLoading || isUploaded

  return (
    <div className="file_input" style={style}>
      <div className="file_drop">
        {!hasStatus && <div className="file_img" />}
        <div className="file_text simple_text">
          <Trans
            t={t}
            i18nKey="browseFiles"
            values={{
              type: fileTypeLabel,
            }}
            components={{ span: <span /> }}
          />
        </div>
        <input
          type="file"
          onChange={(e) => handleChange(e)}
          disabled={disabled}
        />
      </div>
      {isLoading && (
        <div className="file_status status_light">
          <div className="ellipsis">
            {t("uploading")} {fileName}
          </div>
        </div>
      )}
      {!isLoading && !errorMessage && isUploaded && (
        <div className="file_status">
          <SharedIcon
            icon="icons/m/notif-correct.svg"
            width={24}
            color="var(--success)"
            customStyles="flex-shrink:0;"
          />
          <div className="ellipsis">{fileName}</div>
        </div>
      )}
      {!isLoading && errorMessage && (
        <div className="file_status">
          <SharedIcon
            color="var(--error)"
            width={24}
            icon="icons/m/notif-wrong.svg"
            customStyles="flex-shrink:0;"
          />
          {errorMessage}
        </div>
      )}

      <style jsx>
        {`
          .file_input {
            width: 100%;
          }
          .file_drop {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 100%;
            background: var(--green-120);
            border: 1px dashed var(--green-60);
            border-radius: 8px;
            padding: 16px 0 14px;
          }
          .file_drop input {
            cursor: pointer;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            opacity: 0;
          }
          .file_img {
            background: url("./images/json_file.svg");
            background-size: cover;
            width: 46px;
            height: 62px;
            margin-bottom: 12px;
          }
          .file_text {
            width: 220px;
            text-align: center;
            color: var(--green-20);
          }
          .file_text span {
            color: var(--trophy-gold);
          }
          .file_status {
            display: flex;
            gap: 6px;
            margin-top: 16px;
            color: #fff;
            font-weight: 600;
            font-size: 18px;
            line-height: 24px;
            border: 1px solid var(--green-80);
            background: var(--green-60);
            border-radius: 8px;
            padding: 8px 12px;
          }
          .status_light {
            background: transparent;
          }
        `}
      </style>
    </div>
  )
}
