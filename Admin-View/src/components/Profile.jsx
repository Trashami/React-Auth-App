import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.css";
import { Button, Modal, Form } from "react-bootstrap";

const Profile = ({ userApi }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const tableRef = useRef();

  useEffect(() => {
    fetch(userApi)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, [userApi]);

  useEffect(() => {
    if (!loading && users.length > 0) {
      const table = $(tableRef.current).DataTable({
        paging: true,
        searching: true,
        info: true,
        destroy: true,
      });

      return () => {
        table.destroy();
      };
    }
  }, [loading, users]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShowModal = (user = null) => {
    setEditUser(user);
    setFormData(user ? { name: user.name, email: user.email } : { name: "", email: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const handleFormSubmit = () => {
    if (editUser) {

      const updatedUsers = users.map((user) =>
        user.id === editUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
    } else {

      const newUser = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
      };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>User Profiles</h1>
      <Button variant="primary" onClick={() => handleShowModal()}>
        Add User
      </Button>
      <div className="table-responsive mt-3">
        <table ref={tableRef} className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Button variant="warning" onClick={() => handleShowModal(user)}>
                    Edit
                  </Button>{" "}
                  <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editUser ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFormSubmit}>
            {editUser ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
