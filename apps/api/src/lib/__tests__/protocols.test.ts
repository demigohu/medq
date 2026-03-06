import {
  getProtocolByAddress,
  getProtocolByHederaId,
  getAllProtocols,
  getProtocolsByCategory,
  PROTOCOLS,
} from "../protocols"

describe("Protocols", () => {
  describe("getProtocolByAddress", () => {
    it("should return SaucerSwap protocol by EVM address", () => {
      const protocol = getProtocolByAddress(
        "0x0000000000000000000000000000000000004b40"
      )
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("SaucerSwap Finance")
      expect(protocol?.category).toBe("swap")
    })

    it("should return Bonzo protocol by EVM address", () => {
      const protocol = getProtocolByAddress(
        "0x118dd8f2c0f2375496df1e069af1141fa034251b"
      )
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("Bonzo Finance")
      expect(protocol?.category).toBe("lend")
    })

    it("should be case-insensitive", () => {
      const protocol = getProtocolByAddress(
        "0X0000000000000000000000000000000000004B40"
      )
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("SaucerSwap Finance")
    })

    it("should return null for invalid address", () => {
      const protocol = getProtocolByAddress("0xinvalid")
      expect(protocol).toBeNull()
    })
  })

  describe("getProtocolByHederaId", () => {
    it("should return SaucerSwap by Hedera ID", () => {
      const protocol = getProtocolByHederaId("0.0.19264")
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("SaucerSwap Finance")
    })

    it("should return Bonzo by Hedera ID", () => {
      const protocol = getProtocolByHederaId("0.0.7154915")
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("Bonzo Finance")
    })

    it("should return null for invalid ID", () => {
      const protocol = getProtocolByHederaId("0.0.999999")
      expect(protocol).toBeNull()
    })
  })

  describe("getAllProtocols", () => {
    it("should return all protocols", () => {
      const protocols = getAllProtocols()
      expect(protocols.length).toBeGreaterThan(0)
      expect(protocols.length).toBe(Object.keys(PROTOCOLS).length)
    })

    it("should include all required fields", () => {
      const protocols = getAllProtocols()
      protocols.forEach((protocol) => {
        expect(protocol).toHaveProperty("name")
        expect(protocol).toHaveProperty("hederaId")
        expect(protocol).toHaveProperty("evmAddress")
        expect(protocol).toHaveProperty("category")
        expect(protocol).toHaveProperty("website")
        expect(protocol).toHaveProperty("description")
      })
    })
  })

  describe("getProtocolsByCategory", () => {
    it("should return only swap protocols", () => {
      const swapProtocols = getProtocolsByCategory("swap")
      expect(swapProtocols.length).toBeGreaterThan(0)
      swapProtocols.forEach((p) => {
        expect(p.category).toBe("swap")
      })
    })

    it("should return only lend protocols", () => {
      const lendProtocols = getProtocolsByCategory("lend")
      expect(lendProtocols.length).toBeGreaterThan(0)
      lendProtocols.forEach((p) => {
        expect(p.category).toBe("lend")
      })
    })
  })
})

