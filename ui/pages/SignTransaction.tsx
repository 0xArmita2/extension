import React, { ReactElement, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import {
  broadcastSignedTransaction,
  rejectTransactionSignature,
  selectIsTransactionLoaded,
  selectIsTransactionSigned,
  selectTransactionData,
  signTransaction,
} from "@tallyho/tally-background/redux-slices/transaction-construction"
import { getAccountTotal } from "@tallyho/tally-background/redux-slices/selectors"
import { parseERC20Tx } from "@tallyho/tally-background/lib/erc20"
import SharedButton from "../components/Shared/SharedButton"
import SharedPanelSwitcher from "../components/Shared/SharedPanelSwitcher"
import SignTransactionSwapAssetBlock from "../components/SignTransaction/SignTransactionSwapAssetBlock"
import SignTransactionApproveSpendAssetBlock from "../components/SignTransaction/SignTransactionApproveSpendAssetBlock"
import SignTransactionSignBlock from "../components/SignTransaction/SignTransactionSignBlock"
import SignTransactionNetworkAccountInfoTopBar from "../components/SignTransaction/SignTransactionNetworkAccountInfoTopBar"
import {
  useBackgroundDispatch,
  useBackgroundSelector,
  useAreKeyringsUnlocked,
} from "../hooks"
import SignTransactionTransferBlock from "../components/SignTransaction/SignTransactionTransferBlock"
import SignTransactionDetailPanel from "../components/SignTransaction/SignTransactionDetailPanel"

export enum SignType {
  Sign = "sign",
  SignSwap = "sign-swap",
  SignSpend = "sign-spend",
  SignTransfer = "sign-transfer",
}

interface SignLocationState {
  assetSymbol: string
  amount: number
  signType: SignType
  to: string
  value: string | number
}

export default function SignTransaction({
  location,
}: {
  location: { key: string; pathname: string; state?: SignLocationState }
}): ReactElement {
  const history = useHistory()
  const dispatch = useBackgroundDispatch()
  const transactionDetails = useBackgroundSelector(selectTransactionData)

  const parsedTx = parseERC20Tx(transactionDetails?.input ?? "")
  const isApproveTx = parsedTx?.name === "approve"
  const { assetSymbol, amount, to, value, signType } = location.state ?? {
    signType: isApproveTx ? SignType.SignSpend : SignType.Sign,
  }
  const isTransactionDataReady = useBackgroundSelector(
    selectIsTransactionLoaded
  )
  const signedTransaction = useBackgroundSelector(
    ({ transactionConstruction }) => transactionConstruction.signedTransaction
  )

  const isTransactionSigned = useBackgroundSelector(selectIsTransactionSigned)

  const shouldBroadcastOnSign = useBackgroundSelector(
    ({ transactionConstruction }) =>
      transactionConstruction.broadcastOnSign ?? false
  )

  const signerAccountTotal = useBackgroundSelector((state) =>
    typeof transactionDetails === "undefined"
      ? undefined
      : getAccountTotal(state, transactionDetails.from)
  )

  const areKeyringsUnlocked = useAreKeyringsUnlocked(
    signerAccountTotal?.signingMethod?.type === "keyring"
  )

  const [panelNumber, setPanelNumber] = useState(0)
  const [isTransactionSigning, setIsTransactionSigning] = useState(false)

  useEffect(() => {
    if (areKeyringsUnlocked && isTransactionSigned && isTransactionSigning) {
      if (shouldBroadcastOnSign && typeof signedTransaction !== "undefined") {
        dispatch(broadcastSignedTransaction(signedTransaction))
      }

      // Request broadcast if not dApp...
      if (typeof assetSymbol !== "undefined") {
        history.push("/singleAsset", { symbol: assetSymbol })
      } else {
        history.goBack()
      }
    }
  }, [
    areKeyringsUnlocked,
    isTransactionSigned,
    isTransactionSigning,
    history,
    assetSymbol,
    shouldBroadcastOnSign,
    signedTransaction,
    dispatch,
  ])

  if (!areKeyringsUnlocked) {
    return <></>
  }

  if (
    typeof transactionDetails === "undefined" ||
    typeof signerAccountTotal === "undefined"
  ) {
    // TODO Some sort of unexpected state error if we end up here... Or do we
    // go back in history? That won't work for dApp popovers though.
    return <></>
  }

  const signContent: {
    [signType in SignType]: {
      title: string
      component: () => ReactElement
      confirmButtonText: string
    }
  } = {
    [SignType.SignSwap]: {
      title: "Swap assets",
      component: () => <SignTransactionSwapAssetBlock />,
      confirmButtonText: "Confirm",
    },
    [SignType.SignSpend]: {
      title: "Approve asset spend",
      component: () => (
        <SignTransactionApproveSpendAssetBlock
          transactionDetails={transactionDetails}
          parsedTx={parsedTx}
        />
      ),
      confirmButtonText: "Approve",
    },
    [SignType.SignTransfer]: {
      title: "Sign Transfer",
      component: () => (
        <SignTransactionTransferBlock
          token={assetSymbol ?? ""}
          amount={amount ?? 0}
          destination={to ?? ""}
          localizedValue={value ?? ""}
        />
      ),
      confirmButtonText: "Sign",
    },
    [SignType.Sign]: {
      title: "Sign Transaction",
      component: () => (
        <SignTransactionSignBlock transactionDetails={transactionDetails} />
      ),
      confirmButtonText: "Sign",
    },
  }

  const handleReject = async () => {
    await dispatch(rejectTransactionSignature())
    history.goBack()
  }
  const handleConfirm = async () => {
    if (isTransactionDataReady && transactionDetails) {
      dispatch(signTransaction(transactionDetails))
      setIsTransactionSigning(true)
    }
  }

  return (
    <section>
      <SignTransactionNetworkAccountInfoTopBar
        accountTotal={signerAccountTotal}
      />
      <h1 className="serif_header title">{signContent[signType].title}</h1>
      <div className="primary_info_card standard_width">
        {signContent[signType].component()}
      </div>
      <SharedPanelSwitcher
        setPanelNumber={setPanelNumber}
        panelNumber={panelNumber}
        panelNames={["Details"]}
      />
      {panelNumber === 0 ? <SignTransactionDetailPanel /> : null}
      <div className="footer_actions">
        <SharedButton
          iconSize="large"
          size="large"
          type="secondary"
          onClick={handleReject}
        >
          Reject
        </SharedButton>
        {signerAccountTotal.signingMethod ? (
          <SharedButton
            type="primary"
            iconSize="large"
            size="large"
            onClick={handleConfirm}
            showLoadingOnClick
          >
            {signContent[signType].confirmButtonText}
          </SharedButton>
        ) : (
          <span className="no-signing">Read-only accounts cannot sign</span>
        )}
      </div>
      <style jsx>
        {`
          section {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: var(--green-95);
            z-index: 5;
          }
          .title {
            color: var(--trophy-gold);
            font-size: 36px;
            font-weight: 500;
            line-height: 42px;
            text-align: center;
          }
          .primary_info_card {
            display: block;
            height: fit-content;
            border-radius: 16px;
            background-color: var(--hunter-green);
            margin: 16px 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer_actions {
            position: fixed;
            bottom: 0px;
            display: flex;
            width: 100%;
            padding: 0px 16px;
            box-sizing: border-box;
            align-items: center;
            height: 80px;
            justify-content: space-between;
            box-shadow: 0 0 5px rgba(0, 20, 19, 0.5);
            background-color: var(--green-95);
          }
        `}
      </style>
    </section>
  )
}
