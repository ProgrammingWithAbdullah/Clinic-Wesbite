import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditPatientForm.css';

const EditPatientForm = ({ patient, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        contacts: patient.contacts || '',
        age: patient.age || '',
        dateOfentry: patient.dateOfentry ? patient.dateOfentry.split('T')[0] : '',
        medicalHistory: patient.medicalHistory || [],
        doctorName: patient.doctorName || ''
    });

    const [errors, setErrors] = useState({
        firstName: '',
        contacts: '',
        age: ''
    });

    const validate = () => {
        let isValid = true;
        const newErrors = { firstName: '', contacts: '', age: '' };

        if (!formData.firstName) {

            toast.error("First Name is required");
            isValid = false;
        }

        if (formData.contacts && !/^\d{10}$/.test(formData.contacts)) {

            toast.error("Enter a valid 10-digit contact number");
            isValid = false;
        }

        if (formData.age && (formData.age < 1 || formData.age > 101)) {

            toast.error("Enter a valid age not exceeding 101 years");
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            medicalHistory: checked
                ? [...prevData.medicalHistory, name]
                : prevData.medicalHistory.filter((item) => item !== name),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            const submissionData = {
                ...formData,
                contacts: formData.contacts === '' ? null : formData.contacts,
                age: formData.age === '' ? null : formData.age,
               

            };
            toast.success("Successful updation");
            const response = await axios.put(`https://clinic-backend-4.onrender.com/api/patients/${patient._id}`, submissionData);
            onSubmit(response.data);

        } catch (error) {
            console.error('Error updating patient:', error);
            toast.error('Error updating patient details');
        }

    };

    return (
        <>
            <FaTimes id="cross" onClick={onCancel} />
            <p id="title">Edit Patient {formData.firstName} Details</p>
            <form id="pform" onSubmit={handleSubmit}>
                <div className="left-partition">
                    <input
                        placeholder="First Name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}
                    <input
                        placeholder="Last Name"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <div id="dropd">
                        <input
                            type="checkbox"
                            name="bp"
                            checked={formData.medicalHistory.includes('bp')}
                            onChange={handleCheckboxChange}
                        /> BP  <br />
                        <input
                            type="checkbox"
                            name="act"
                            checked={formData.medicalHistory.includes('act')}
                            onChange={handleCheckboxChange}
                        /> ACT <br />
                        <input
                            type="checkbox"
                            name="asthama"
                            checked={formData.medicalHistory.includes('asthama')}
                            onChange={handleCheckboxChange}
                        /> Asthma <br />
                        <input
                            type="checkbox"
                            name="thyroid"
                            checked={formData.medicalHistory.includes('thyroid')}
                            onChange={handleCheckboxChange}
                        /> Thyroid  <br />
                        <input
                            type="checkbox"
                            name="dm"
                            checked={formData.medicalHistory.includes('dm')}
                            onChange={handleCheckboxChange}
                        /> Diabetes   <br />
                        <input
                            type="checkbox"
                            name="pregnancy"
                            checked={formData.medicalHistory.includes('pregnancy')}
                            onChange={handleCheckboxChange}
                        /> Pregnant<br />
                    </div>
                </div>
                <div className="right-partition">
                    <input
                        placeholder="Contact"
                        type="text"
                        name="contacts"
                        value={formData.contacts}
                        onChange={handleChange}
                    />
                    {errors.contacts && <span style={{ color: 'red' }}>{errors.contacts}</span>}
                    <input
                        placeholder="Age"
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                    />
                    {errors.age && <span style={{ color: 'red' }}>{errors.age}</span>}
                    <input
                        id="date"
                        placeholder="Date"
                        type="date"
                        name="dateOfentry"
                        value={formData.dateOfentry}
                        onChange={handleChange}
                    />
                    <select
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                    >
                        <option value="">Doctor</option>
                        <option value="Dr Ruchi">Dr Ruchi</option>
                        <option value="Dr Renu">Dr Renu</option>
                        <option value="Other">Other</option>
                    </select>
                    <button id="subbtn" type="submit">Edit Details</button>
                </div>
            </form>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
};

export default EditPatientForm;