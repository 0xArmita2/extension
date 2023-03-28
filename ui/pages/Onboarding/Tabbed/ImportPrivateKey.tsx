import { importSigner } from "@tallyho/tally-background/redux-slices/keyrings"
import { SignerTypes } from "@tallyho/tally-background/services/keyring"
import { isHexString } from "ethers/lib/utils"
import React, { ReactElement, useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch } from "react-redux"
import SharedButton from "../../../components/Shared/SharedButton"
import SharedSeedInput from "../../../components/Shared/SharedSeedInput"

type Props = {
  setIsImporting: (value: boolean) => void
}

function validatePrivateKey(privateKey = ""): boolean {
  try {
    const paddedKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`
    // valid pk has 32 bytes -> 64 hex characters
    return (
      isHexString(paddedKey) && BigInt(paddedKey).toString(16).length === 64
    )
  } catch (e) {
    return false
  }
}

export default function ImportPrivateKey(props: Props): ReactElement {
  const { setIsImporting } = props

  const dispatch = useDispatch()

  const [privateKey, setPrivateKey] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const { t } = useTranslation("translation", {
    keyPrefix: "onboarding.tabbed.addWallet.importPrivateKey",
  })

  const importWallet = useCallback(async () => {
    const trimmedPrivateKey = privateKey.toLowerCase().trim()
    if (validatePrivateKey(trimmedPrivateKey)) {
      setIsImporting(true)
      dispatch(
        importSigner({
          type: SignerTypes.privateKey,
          privateKey: trimmedPrivateKey,
        })
      )
    } else {
      setErrorMessage(t("error"))
    }
  }, [dispatch, privateKey, setIsImporting, t])

  return (
    <>
      <SharedSeedInput
        onChange={(pk) => setPrivateKey(pk)}
        label={t("inputLabel")}
        errorMessage={errorMessage}
      />
      <SharedButton
        style={{ width: "100%", maxWidth: "320px", marginTop: "25px" }}
        size="medium"
        type="primary"
        isDisabled={!privateKey}
        onClick={importWallet}
        center
      >
        {t("submit")}
      </SharedButton>
      <style jsx>{`
        .bottom {
          width: 100%;
          margin: 25px auto 0;
        }
      `}</style>
    </>
  )
}
