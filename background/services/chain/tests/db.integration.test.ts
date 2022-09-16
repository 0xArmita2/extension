import { IDBFactory } from "fake-indexeddb"
import { ETHEREUM, POLYGON } from "../../../constants"
import { createAccountBalance } from "../../../tests/factories"
import { ChainDatabase, createDB } from "../db"

describe("Chain Database ", () => {
  let db: ChainDatabase

  const account1 = {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    network: ETHEREUM,
  }

  const account2 = {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    network: POLYGON,
  }

  beforeEach(() => {
    // Reset state of indexedDB
    indexedDB = new IDBFactory()
    db = createDB({ indexedDB })
  })

  describe("addAccountToTrack", () => {
    it("should correctly add accounts to track to indexedDB", async () => {
      expect(await db.getAccountsToTrack()).toHaveLength(0)
      await db.addAccountToTrack(account1)
      expect(await db.getAccountsToTrack()).toHaveLength(1)
      await db.addAccountToTrack(account2)
      const accountsToTrack = await db.getAccountsToTrack()
      expect(accountsToTrack).toEqual([account1, account2])
    })

    it("should not add the same account twice.", async () => {
      expect(await db.getAccountsToTrack()).toHaveLength(0)
      await db.addAccountToTrack(account1)
      expect(await db.getAccountsToTrack()).toHaveLength(1)
      await db.addAccountToTrack(account1)
      expect(await db.getAccountsToTrack()).toEqual([account1])
    })
  })
  describe("addBalance", () => {
    it("Should correctly add balances to indexedDB", async () => {
      expect((await db.table("balances").toArray()).length).toEqual(0)
      const accountBalance = createAccountBalance()
      await db.addBalance(accountBalance)
      const accountBalances = await db.table("balances").toArray()
      expect(accountBalances).toEqual([accountBalance])
    })
  })
  xdescribe("addBlock", () => {})
  xdescribe("addOrUpdateTransaction", () => {})
  xdescribe("getAccountsToTrack", () => {})
  xdescribe("getAllSavedTransactionHashes", () => {})
  xdescribe("getBlock", () => {})
  xdescribe("getChainIdsToTrack", () => {})
  xdescribe("getLatestAccountBalance", () => {})
  xdescribe("getLatestBlock", () => {})
  xdescribe("getNetworkPendingTransactions", () => {})
  xdescribe("getNewestAccountAssetTransferLookup", () => {})
  xdescribe("getOldestAccountAssetTransferLookup", () => {})
  xdescribe("getTransaction", () => {})
  xdescribe("recordAccountAssetTransferLookup", () => {})
  xdescribe("removeAccountToTrack", () => {})
  xdescribe("removeAccountToTrack", () => {})
})
