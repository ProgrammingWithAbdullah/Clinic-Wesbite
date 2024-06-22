import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchPatients.css';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditPatientForm from './EditPatientForm';

const SearchPatients = () => {
    const [searchType, setSearchType] = useState('patient');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [editingPatient, setEditingPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('https://clinic-backend-4.onrender.com/api/doctors');
                setDoctorOptions(response.data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctors();
    }, []);

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setSearchQuery('');
        setSearchError('');
    };

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint;
            if (searchType === 'patient') {
                endpoint = `https://clinic-backend-4.onrender.com/api/patients/search?firstName=${searchQuery.trim().toLowerCase()}`;
            } else if (searchType === 'doctor') {
                endpoint = `https://clinic-backend-4.onrender.com/api/patients/search?doctorName=${searchQuery}`;
            }

            const response = await axios.get(endpoint);
            setSearchResults(response.data.map(patient => ({
                ...patient,
                medicalHistory: patient.medicalHistory.join(', '),
                dateOfentry: formatDate(patient.dateOfentry)
            })));
            if (response.data.length === 0) {
                setSearchError('Patient not found');
                toast.error('Patient not found');
            } else {
                setSearchError('');
            }
        } catch (error) {
            console.error('Error searching patients:', error);
            toast.error('Error searching patients. Please try again later.');
        }
    };

    // const handleEdit = (patient) => {
    //     setEditingPatient(patient);
    //     setIsModalOpen(true);
    // };

    const handleCancelEdit = () => {
        setEditingPatient(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id, firstName) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete ${firstName}?`);
        if (isConfirmed) {
            try {
                await axios.delete(`https://clinic-backend-4.onrender.com/api/patients/${id}`);
                setSearchResults(prevResults => prevResults.filter(patient => patient._id !== id));
                toast.success(`Patient ${firstName} successfully deleted`);
            } catch (error) {
                console.error('Error deleting patient:', error);
                toast.error('Error deleting patient. Please try again later.');
            }
        } else {
            toast.warning(`Deletion cancelled for ${firstName}`);
        }
    };

    const handleEditSubmit = (updatedPatient) => {
        setSearchResults(prevResults =>
            prevResults.map(patient =>
                patient._id === updatedPatient._id ? {
                    ...updatedPatient,
                    dateOfentry: formatDate(updatedPatient.dateOfentry)
                } : patient
            )
        );
        setEditingPatient(null);
        setIsModalOpen(false);
        toast.success(`Patient ${updatedPatient.firstName} updated successfully`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <div className="container">
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="form-group">
                        <label>
                            Search :
                            <select id="patname" value={searchType} onChange={handleSearchTypeChange}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            {searchType === 'patient' ? 'Name : ' : ''}
                            {searchType === 'doctor' ? (
                                <select id="docs" value={searchQuery} onChange={handleSearchQueryChange} required>
                                    <option value="">Doctor</option>
                                    <option value="Dr Ruchi">Dr Ruchi</option>
                                    <option value="Dr Renu">Dr Renu</option>
                                    <option value="Other">Other</option>
                                    {doctorOptions.map((doctor) => (
                                        <option key={doctor._id} value={doctor.name}>
                                            {doctor.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id="inn"
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchQueryChange}
                                    required
                                />
                            )}
                        </label>
                    </div>
                    <button type="submit" className="btn-search">
                        Search
                    </button>
                </form>

                <div id="searchRes" className="search-results">
                    <h3>{`Showing ${searchResults.length} results for ${searchType === 'patient' ? 'Patient' : 'Doctor'}: ${searchQuery}`}</h3>
                    {searchError && <p>{searchError}</p>}
                    <ul>
                        {searchResults.map((patient) => (
                            <li key={patient._id} className="patient-card">
                                <div className="patient-info">
                                    <i className="fa-solid fa-hospital-user" style={{ color: "grey" }} ></i> :  {patient.firstName} {patient.lastName}
                                    <br />
                                    <i className="fa-solid fa-phone" style={{ color: "blue" }}></i> :  {patient.contacts}
                                    <br />
                                    <i className="fa-solid fa-cake-candles" style={{ color: "green" }}></i> :  {patient.age} Years
                                    <br />
                                    <i className="fa-solid fa-calendar-days calendar" style={{ color: "blue" }}></i> :  {patient.dateOfentry}
                                    <br />
                                    <div className="medhis">
                                        <i className="fa-solid fa-book-medical" style={{ color: "red" }}></i> : {patient.medicalHistory}
                                    </div>
                                    <i className="fa-solid fa-user-doctor" style={{ color: "violet" }}></i> : {patient.doctorName}
                                    <br />
                                </div>
                                <div className="button-containers">
                                    {/* <button id="edtbtns" onClick={() => handleEdit(patient)} >Edit</button> */}
                                    <button id="delbtns" onClick={() => handleDelete(patient._id, patient.firstName)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCancelEdit}
                contentLabel="Edit Patient"
                className="modal"
                overlayClassName="overlay"
            >
                {editingPatient && (
                    <EditPatientForm
                        patient={editingPatient}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCancelEdit}
                    />
                )}
            </Modal>

            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover />
        </>
    );
};

export default SearchPatients;