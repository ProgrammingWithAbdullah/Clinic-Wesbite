import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './ShowAllPatients.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditPatientForm from './EditPatientForm';

Modal.setAppElement('#root');

const ShowAllPatients = () => {
    const [allPatients, setAllPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        const fetchAllPatients = async () => {
            try {
                const response = await axios.get('https://clinic-backend-4.onrender.com/api/patients/all');
                const sortedPatients = response.data.sort((a, b) => a.firstName.localeCompare(b.firstName));
                setAllPatients(sortedPatients);
            } catch (error) {
                console.error('Error fetching all patients:', error);
                toast.error('Error fetching all patients. Please try again later.');
            }
        };
        fetchAllPatients();
    }, []);

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (patientId, patientFirstName) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${patientFirstName}?`);
        if (confirmDelete) {
            try {
                await axios.delete(`https://clinic-backend-4.onrender.com/api/patients/${patientId}`);
                setAllPatients(allPatients.filter(patient => patient._id !== patientId));
                toast.success(`Patient ${patientFirstName} deleted successfully`);
            } catch (error) {
                console.error('Error deleting patient:', error);
                toast.error('Error deleting patient. Please try again later.');
            }
        } else {
            toast.warning(`Deletion cancelled for ${patientFirstName}`);
        }
        closeDetailsModal();
    };

    const handleEditClick = (patient) => {
        setEditingPatient(patient);
        setIsEditModalOpen(true);
        setIsDetailsModalOpen(false);
    };

    const handleEditSubmit = (updatedPatient) => {
        setAllPatients(allPatients.map(patient => patient._id === updatedPatient._id ? updatedPatient : patient));
        setEditingPatient(null);
        setIsEditModalOpen(false);
        toast.success(`Patient ${updatedPatient.firstName} updated successfully`);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingPatient(null);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedPatient(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        return formattedDate;
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get('https://clinic-backend-4.onrender.com/api/patients/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'patients.csv');
            document.body.appendChild(link);
            link.click();
            toast.success('CSV file downloaded successfully');
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            toast.error('Error exporting to CSV. Please try again later.');
        }
    };

    return (
        <div id="showallpatients">
            {allPatients.length === 0 ? (
                <p>Patient Database is empty</p>
            ) : (
                <>
                    
                   
                   
                    <div class="button-group">
                    <button id="csvbtn" onClick={handleExportCSV} >Download CSV</button>
                        <div id="counts">  {allPatients.length} Patients</div>
                         <i className="fa-solid fa-circle-info"></i> <p id="infor" >Click on Patient name to see or Edit details</p>
                    </div>
                   
                    <ul>
                        {allPatients.map(patient => (
                            <li key={patient._id}>
                                <div onClick={() => handlePatientClick(patient)}>
                                    {patient.firstName} {patient.lastName}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <Modal id="patdetails"
                isOpen={isDetailsModalOpen}
                onRequestClose={closeDetailsModal}
                contentLabel="Patient Details"
                className="modal"
                overlayClassName="overlay"
            >
                {selectedPatient && (
                    <div id="pcard">
                        <i className="fa fa-times cancel-icon" onClick={closeDetailsModal}></i>
                        <h1>{selectedPatient.firstName} {selectedPatient.lastName}</h1>
                        <h5><i className="fa-solid fa-phone" style={{ color: "blue" }}></i> : <a href={`tel:${selectedPatient.contacts}`}>{selectedPatient.contacts}</a></h5>
                        <h5><i className="fa-solid fa-cake-candles" style={{ color: "green" }}></i> : {selectedPatient.age} Years</h5>
                        <h5><i className="fa-solid fa-calendar-days calendar" style={{ color: "blue" }}></i> : {formatDate(selectedPatient.dateOfentry)}</h5>
                        <h5><i className="fa-solid fa-book-medical" style={{ color: "red" }}></i> : {selectedPatient.medicalHistory.join(', ')}</h5>
                        <h5><i className="fa-solid fa-user-doctor" style={{ color: "violet" }}></i> : {selectedPatient.doctorName}</h5>
                        <div className="button-container">
                            <button id="edtbtn" onClick={() => handleEditClick(selectedPatient)}>Edit</button>
                            <button id="delbtn" onClick={() => handleDelete(selectedPatient._id, selectedPatient.firstName)}>Delete</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal id="editmodal"
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Patient"
                className="modal"
                overlayClassName="overlay"
            >
                {editingPatient && <EditPatientForm patient={editingPatient} onSubmit={handleEditSubmit} onCancel={closeEditModal} />}
            </Modal>

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default ShowAllPatients;
