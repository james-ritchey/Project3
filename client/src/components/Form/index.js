import React from 'react';

export const Form = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Username</label>
        <input className="form-control" id="name" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          placeholder=""
        />
      </div>
      <div className="form-group">
        <button className="form-control btn btn-danger" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
};
export default Form;