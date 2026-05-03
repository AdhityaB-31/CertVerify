// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerification
 * @dev Blockchain-based Academic Certificate Issuance and Verification System
 *      Built for Manakula Vinayagar Institute of Technology
 *      Phase-II Implementation
 */
contract CertificateVerification {

    // ─── OWNER ───────────────────────────────────────────────────────────────
    address public owner;

    // ─── DATA STRUCTURES ─────────────────────────────────────────────────────

    struct Certificate {
        string  certificateId;      // Unique certificate number e.g. "MVIT-2024-001"
        string  studentName;        // Full name of the student
        string  registrationNumber; // University registration number
        string  degree;             // Degree awarded e.g. "B.Tech Information Technology"
        string  institution;        // Issuing institution name
        string  ipfsHash;           // IPFS CID of the certificate PDF
        uint256 issueDate;          // Unix timestamp of issuance
        bool    isValid;            // Whether certificate is currently valid (not revoked)
        address issuedBy;           // Wallet address of the institution that issued
    }

    struct Institution {
        string  name;
        bool    isAuthorized;
    }

    // ─── STORAGE ─────────────────────────────────────────────────────────────

    // certificateId  => Certificate
    mapping(string => Certificate) private certificates;

    // wallet address => Institution info
    mapping(address => Institution) private institutions;

    // registrationNumber => list of certificateIds (a student may have multiple certs)
    mapping(string => string[]) private studentCertificates;

    // keep a count for stats
    uint256 public totalCertificates;

    // ─── EVENTS ──────────────────────────────────────────────────────────────

    event InstitutionAuthorized(address indexed institutionAddress, string name);
    event InstitutionRevoked(address indexed institutionAddress);
    event CertificateIssued(
        string indexed certificateId,
        string studentName,
        string registrationNumber,
        string degree,
        uint256 issueDate
    );
    event CertificateRevoked(string indexed certificateId, address revokedBy);

    // ─── MODIFIERS ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this");
        _;
    }

    modifier onlyAuthorizedInstitution() {
        require(
            institutions[msg.sender].isAuthorized,
            "Caller is not an authorized institution"
        );
        _;
    }

    modifier certificateExists(string memory _certificateId) {
        require(
            bytes(certificates[_certificateId].certificateId).length > 0,
            "Certificate does not exist"
        );
        _;
    }

    // ─── CONSTRUCTOR ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        // Auto-authorize the deployer as an institution (for demo/testing)
        institutions[msg.sender] = Institution("Contract Owner / Admin", true);
        emit InstitutionAuthorized(msg.sender, "Contract Owner / Admin");
    }

    // ─── ADMIN FUNCTIONS ─────────────────────────────────────────────────────

    /**
     * @dev Authorize a new institution to issue certificates
     * @param _address  Wallet address of the institution
     * @param _name     Human-readable name of the institution
     */
    function authorizeInstitution(address _address, string memory _name)
        public
        onlyOwner
    {
        require(_address != address(0), "Invalid address");
        require(bytes(_name).length > 0,  "Institution name required");
        institutions[_address] = Institution(_name, true);
        emit InstitutionAuthorized(_address, _name);
    }

    /**
     * @dev Revoke an institution's authorization
     */
    function revokeInstitution(address _address) public onlyOwner {
        require(institutions[_address].isAuthorized, "Institution not authorized");
        institutions[_address].isAuthorized = false;
        emit InstitutionRevoked(_address);
    }

    // ─── CERTIFICATE ISSUANCE ────────────────────────────────────────────────

    /**
     * @dev Issue a new academic certificate (only authorized institutions)
     */
    function issueCertificate(
        string memory _certificateId,
        string memory _studentName,
        string memory _registrationNumber,
        string memory _degree,
        string memory _institution,
        string memory _ipfsHash
    ) public onlyAuthorizedInstitution {
        // Validate inputs
        require(bytes(_certificateId).length > 0,      "Certificate ID required");
        require(bytes(_studentName).length > 0,        "Student name required");
        require(bytes(_registrationNumber).length > 0, "Registration number required");
        require(bytes(_degree).length > 0,             "Degree required");
        require(bytes(_institution).length > 0,        "Institution required");
        require(bytes(_ipfsHash).length > 0,           "IPFS hash required");

        // Prevent duplicate certificates
        require(
            bytes(certificates[_certificateId].certificateId).length == 0,
            "Certificate ID already exists"
        );

        // Store on blockchain
        certificates[_certificateId] = Certificate({
            certificateId:      _certificateId,
            studentName:        _studentName,
            registrationNumber: _registrationNumber,
            degree:             _degree,
            institution:        _institution,
            ipfsHash:           _ipfsHash,
            issueDate:          block.timestamp,
            isValid:            true,
            issuedBy:           msg.sender
        });

        // Index by registration number
        studentCertificates[_registrationNumber].push(_certificateId);

        totalCertificates++;

        emit CertificateIssued(
            _certificateId,
            _studentName,
            _registrationNumber,
            _degree,
            block.timestamp
        );
    }

    // ─── CERTIFICATE REVOCATION ──────────────────────────────────────────────

    /**
     * @dev Revoke a certificate (only owner or the institution that issued it)
     */
    function revokeCertificate(string memory _certificateId)
        public
        certificateExists(_certificateId)
    {
        Certificate storage cert = certificates[_certificateId];
        require(
            msg.sender == owner || msg.sender == cert.issuedBy,
            "Not authorized to revoke this certificate"
        );
        require(cert.isValid, "Certificate already revoked");

        cert.isValid = false;
        emit CertificateRevoked(_certificateId, msg.sender);
    }

    // ─── VERIFICATION / READ FUNCTIONS ───────────────────────────────────────

    // /*
    //  * @dev Verify a certificate by its ID — main verification function
    //  * @return All certificate fields + a boolean `verified` indicating validity
    //  */
    function verifyCertificate(string memory _certificateId)
        public
        view
        returns (
            string  memory certificateId,
            string  memory studentName,
            string  memory registrationNumber,
            string  memory degree,
            string  memory institution,
            string  memory ipfsHash,
            uint256        issueDate,
            bool           isValid,
            address        issuedBy,
            bool           verified     // true = exists AND valid
        )
    {
        Certificate memory cert = certificates[_certificateId];

        if (bytes(cert.certificateId).length == 0) {
            // Certificate not found — return empty with verified = false
            return ("", "", "", "", "", "", 0, false, address(0), false);
        }

        return (
            cert.certificateId,
            cert.studentName,
            cert.registrationNumber,
            cert.degree,
            cert.institution,
            cert.ipfsHash,
            cert.issueDate,
            cert.isValid,
            cert.issuedBy,
            cert.isValid   // verified = true only if not revoked
        );
    }

    /**
     * @dev Get all certificate IDs for a student by registration number
     */
    function getStudentCertificates(string memory _registrationNumber)
        public
        view
        returns (string[] memory)
    {
        return studentCertificates[_registrationNumber];
    }

    /**
     * @dev Check if an institution is authorized
     */
    function isInstitutionAuthorized(address _address)
        public
        view
        returns (bool, string memory)
    {
        Institution memory inst = institutions[_address];
        return (inst.isAuthorized, inst.name);
    }

    /**
     * @dev Check if a certificate ID already exists (used by frontend before issuing)
     */
    function certificateIdExists(string memory _certificateId)
        public
        view
        returns (bool)
    {
        return bytes(certificates[_certificateId].certificateId).length > 0;
    }
}
