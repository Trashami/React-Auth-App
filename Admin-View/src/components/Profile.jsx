import { useState, useEffect } from "react";
import $ from 'jquery';
import 'datatables.net-bs5/css/dataTables.bootstrap5.css';
import 'datatables.net';
import { useMsal } from "@azure/msal-react";
import { loginRequest, silentRequest } from "../auth/authConfig";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = ({ userApi }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ Title: "", Description: "", Floor: "", Active: "true" });
  const [editMode, setEditMode] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const { instance, accounts } = useMsal();
  const user = accounts[0];
  const [listTitle, setListTitle] = useState("Desks List");

  useEffect(() => {
    if (user) {
      fetchSharePointData();
    }
  }, [user, userApi]);

  const fetchSharePointData = async () => {
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...silentRequest,
        account: user,
      });
  
      const listInfoUrl = userApi.replace("/items", "");
      const listInfoResponse = await fetch(listInfoUrl, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
          Accept: "application/json",
        },
      });
  
      if (!listInfoResponse.ok) {
        const errorText = await listInfoResponse.text();
        throw new Error(`HTTP error! Status: ${listInfoResponse.status}, Message: ${errorText}`);
      }
  
      const listInfo = await listInfoResponse.json();
      setListTitle(listInfo.Title || "Desks List");
  
      const response = await fetch(userApi, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
          Accept: "application/json",
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
  
      const data = await response.json();
      setItems(data.value);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items from SharePoint:", error);
      setLoading(false);
    }
  };
  
  const handleShowModal = () => {
    setFormData({ Title: "", Description: "", Floor: "", Active: "true" });
    setEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (item) => { 
    setFormData({ 
      Title: item.Title, 
      Description: item.Description, 
      Floor: item.Floor, 
      Active: item.Active ? "true" : "false" 
    });
    setSelectedItemId(item.Id); 
    setEditMode(true);
    setShowModal(true);
  };

  const handleView = (item) => {
    setViewData(item);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this desk?")) {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...silentRequest,
          account: user,
        });

        const apiUrl = `${userApi}(${itemId})`;
        console.log(apiUrl);

        const response = await fetch(apiUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "If-Match": "*", 
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        setItems(items.filter((item) => item.Id !== itemId));
      } catch (error) {
        console.error("Error deleting desk:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...silentRequest,
        account: user,
      });
  
      const apiUrl = editMode ? `${userApi}(${selectedItemId})` : userApi;
      
      let etag = "*"; 
      
      if (editMode) {
        
        const etagResponse = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            Accept: "application/json",
          },
        });
        
        if (!etagResponse.ok) {
          const errorText = await etagResponse.text();
          throw new Error(`HTTP error! Status: ${etagResponse.status}, Message: ${errorText}`);
        }
  
        const itemData = await etagResponse.json();
        etag = itemData['odata.etag'] || itemData['@odata.etag'];
      }
      
      const method = editMode ? "PATCH" : "POST";
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "If-Match": etag, 
        },
        body: JSON.stringify({
          Title: formData.Title,
          Description: formData.Description,
          Floor: formData.Floor,
          Active: formData.Active === "true",
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      let updatedItem = null;
      const responseText = await response.text();
      if (responseText) {
        updatedItem = JSON.parse(responseText); 
      }
  

      if (editMode && updatedItem) {
        setItems((prevItems) =>
          prevItems.map((item) => (item.Id === selectedItemId ? updatedItem : item))
        );
      } else if (updatedItem) {
        setItems((prevItems) => [...prevItems, updatedItem]);
      }
  
      await fetchSharePointData();
  
      handleCloseModal();
    } catch (error) {
      console.error("Error saving desk:", error);
    }
  };
  
  
  const handleCloseModal = () => {
    setShowModal(false);
    setViewData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterToggle = () => {
    setShowOnlyActive((prev) => !prev);
  };

  const filteredItems = showOnlyActive ? items.filter((item) => item.Active) : items;

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h1>{listTitle}</h1>
      <button className="btn btn-primary" onClick={handleShowModal}>
        Create New Desk
      </button>{" "}
      <button className="btn btn-secondary" onClick={handleFilterToggle}>
        {showOnlyActive ? "Show All Desks" : "Show Only Active Desks"}
      </button>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? "Edit Desk" : "Create New Desk"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="deskTitle" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="deskTitle"
                      name="Title"
                      value={formData.Title}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="deskDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="deskDescription"
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="deskFloor" className="form-label">Floor</label>
                    <input
                      type="text"
                      className="form-control"
                      id="deskFloor"
                      name="Floor"
                      value={formData.Floor}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="active" className="form-label">Active</label>
                    <select
                      className="form-control"
                      id="active"
                      name="Active"
                      value={formData.Active}
                      onChange={handleChange}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  {editMode ? "Save Changes" : "Create Desk"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewData && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Desk Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <dl>
                  <dt>Title</dt>
                  <dd>{viewData.Title}</dd>
                  <dt>Description</dt>
                  <dd>{viewData.Description}</dd>
                  <dt>Floor</dt>
                  <dd>{viewData.Floor}</dd>
                  <dt>Created</dt>
                  <dd>{new Date(viewData.Created).toLocaleString()}</dd>
                  <dt>Modified</dt>
                  <dd>{new Date(viewData.Modified).toLocaleString()}</dd>
                  <dt>Active</dt>
                  <dd>{viewData.Active ? "Yes" : "No"}</dd>
                  <dt>Author ID</dt>
                  <dd>{viewData.AuthorId}</dd>
                  <dt>GUID</dt>
                  <dd>{viewData.GUID}</dd>
                </dl>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Floor</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.Id}>
              <td>{item.Id}</td>
              <td>{item.Title}</td>
              <td>{item.Description}</td>
              <td>{item.Floor}</td>
              <td>{item.Active ? "Yes" : "No"}</td>
              <td>
                <button className="btn btn-info btn-sm" onClick={() => handleView(item)}>
                  View
                </button>{" "}
                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(item)}>
                  Edit
                </button>{" "}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.Id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Profile;
