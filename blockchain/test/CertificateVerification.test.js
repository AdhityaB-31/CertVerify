// test/CertificateVerification.test.js
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("CertificateVerification", function () {
  let contract;
  let owner, institution1, institution2, stranger;

  // Sample certificate data
  const sampleCert = {
    id:     "MVIT-2024-001",
    name:   "Adhitya B",
    regNo:  "22TH0204",
    degree: "B.Tech Information Technology",
    inst:   "Manakula Vinayagar Institute of Technology",
    ipfs:   "QmSampleIPFSHashABC123",
  };

  beforeEach(async () => {
    [owner, institution1, institution2, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertificateVerification");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("Should set deployer as owner", async () => {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should auto-authorize deployer as institution", async () => {
      const [auth] = await contract.isInstitutionAuthorized(owner.address);
      expect(auth).to.be.true;
    });

    it("Should start with 0 certificates", async () => {
      expect(await contract.totalCertificates()).to.equal(0);
    });
  });

  // ── Institution Authorization ─────────────────────────────────────────────
  describe("Institution Authorization", () => {
    it("Owner can authorize an institution", async () => {
      await contract.authorizeInstitution(institution1.address, "Test University");
      const [auth, name] = await contract.isInstitutionAuthorized(institution1.address);
      expect(auth).to.be.true;
      expect(name).to.equal("Test University");
    });

    it("Non-owner cannot authorize an institution", async () => {
      await expect(
        contract.connect(stranger).authorizeInstitution(institution1.address, "Fake Uni")
      ).to.be.revertedWith("Only contract owner can call this");
    });

    it("Owner can revoke institution authorization", async () => {
      await contract.authorizeInstitution(institution1.address, "Test University");
      await contract.revokeInstitution(institution1.address);
      const [auth] = await contract.isInstitutionAuthorized(institution1.address);
      expect(auth).to.be.false;
    });
  });

  // ── Certificate Issuance ──────────────────────────────────────────────────
  describe("Certificate Issuance", () => {
    it("Authorized institution can issue a certificate", async () => {
      await contract.issueCertificate(
        sampleCert.id, sampleCert.name, sampleCert.regNo,
        sampleCert.degree, sampleCert.inst, sampleCert.ipfs
      );
      expect(await contract.totalCertificates()).to.equal(1);
    });

    it("Unauthorized address cannot issue a certificate", async () => {
      await expect(
        contract.connect(stranger).issueCertificate(
          sampleCert.id, sampleCert.name, sampleCert.regNo,
          sampleCert.degree, sampleCert.inst, sampleCert.ipfs
        )
      ).to.be.revertedWith("Caller is not an authorized institution");
    });

    it("Cannot issue duplicate certificate ID", async () => {
      await contract.issueCertificate(
        sampleCert.id, sampleCert.name, sampleCert.regNo,
        sampleCert.degree, sampleCert.inst, sampleCert.ipfs
      );
      await expect(
        contract.issueCertificate(
          sampleCert.id, "Another Student", "22TH9999",
          sampleCert.degree, sampleCert.inst, sampleCert.ipfs
        )
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Emits CertificateIssued event", async () => {
      await expect(
        contract.issueCertificate(
          sampleCert.id, sampleCert.name, sampleCert.regNo,
          sampleCert.degree, sampleCert.inst, sampleCert.ipfs
        )
      )
        .to.emit(contract, "CertificateIssued")
        .withArgs(
          sampleCert.id,
          sampleCert.name,
          sampleCert.regNo,
          sampleCert.degree,
          (await ethers.provider.getBlock("latest")).timestamp + 1
        );
    });
  });

  // ── Certificate Verification ──────────────────────────────────────────────
  describe("Certificate Verification", () => {
    beforeEach(async () => {
      await contract.issueCertificate(
        sampleCert.id, sampleCert.name, sampleCert.regNo,
        sampleCert.degree, sampleCert.inst, sampleCert.ipfs
      );
    });

    it("Should verify a valid certificate", async () => {
      const result = await contract.verifyCertificate(sampleCert.id);
      expect(result.verified).to.be.true;
      expect(result.studentName).to.equal(sampleCert.name);
      expect(result.registrationNumber).to.equal(sampleCert.regNo);
      expect(result.degree).to.equal(sampleCert.degree);
      expect(result.ipfsHash).to.equal(sampleCert.ipfs);
    });

    it("Should return verified=false for non-existent certificate", async () => {
      const result = await contract.verifyCertificate("FAKE-ID-999");
      expect(result.verified).to.be.false;
    });

    it("Should return all certificates for a student by reg number", async () => {
      const certs = await contract.getStudentCertificates(sampleCert.regNo);
      expect(certs.length).to.equal(1);
      expect(certs[0]).to.equal(sampleCert.id);
    });
  });

  // ── Certificate Revocation ────────────────────────────────────────────────
  describe("Certificate Revocation", () => {
    beforeEach(async () => {
      await contract.issueCertificate(
        sampleCert.id, sampleCert.name, sampleCert.regNo,
        sampleCert.degree, sampleCert.inst, sampleCert.ipfs
      );
    });

    it("Owner can revoke a certificate", async () => {
      await contract.revokeCertificate(sampleCert.id);
      const result = await contract.verifyCertificate(sampleCert.id);
      expect(result.isValid).to.be.false;
      expect(result.verified).to.be.false;
    });

    it("Stranger cannot revoke a certificate", async () => {
      await expect(
        contract.connect(stranger).revokeCertificate(sampleCert.id)
      ).to.be.revertedWith("Not authorized to revoke this certificate");
    });

    it("Cannot revoke an already revoked certificate", async () => {
      await contract.revokeCertificate(sampleCert.id);
      await expect(
        contract.revokeCertificate(sampleCert.id)
      ).to.be.revertedWith("Certificate already revoked");
    });
  });
});
