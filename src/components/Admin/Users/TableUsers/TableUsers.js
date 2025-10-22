import React from "react";
import { Table, Button, Icon } from "semantic-ui-react";
import { map } from "lodash";
import "./TableUsers.scss";

// ...import y resto igual

export function TableUsers(props) {
  const { users, updateUser, onDeleteUser } = props;

  return (
    <Table className="table-users-admin">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Username</Table.HeaderCell>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell>Nombre</Table.HeaderCell>
          <Table.HeaderCell>Apellidos</Table.HeaderCell>
          <Table.HeaderCell>Activo</Table.HeaderCell>
          <Table.HeaderCell>Staff</Table.HeaderCell>
          <Table.HeaderCell>En línea</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {map(users, (user, index) => (
          <Table.Row key={index}>
            <Table.Cell data-label="Username">{user.username}</Table.Cell>
            <Table.Cell data-label="Email">{user.email}</Table.Cell>
            <Table.Cell data-label="Nombre">{user.first_name}</Table.Cell>
            <Table.Cell data-label="Apellidos">{user.last_name}</Table.Cell>
            <Table.Cell className="status" data-label="Activo">
              {user.is_active ? <Icon name="check" /> : <Icon name="close" />}
            </Table.Cell>
            <Table.Cell className="status" data-label="Staff">
              {user.is_staff ? <Icon name="check" /> : <Icon name="close" />}
            </Table.Cell>
            <Table.Cell className="status" data-label="En línea">
              {user.is_online ? (
                <Icon name="circle" color="green" />
              ) : (
                <Icon name="circle outline" />
              )}
            </Table.Cell>

            <Actions
              user={user}
              updateUser={updateUser}
              onDeleteUser={onDeleteUser}
            />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function Actions(props) {
  const { user, updateUser, onDeleteUser } = props;

  return (
    <Table.Cell textAlign="right" data-label="Acciones" className="actions-cell">
      <Button icon onClick={() => updateUser(user)}>
        <Icon name="pencil" />
      </Button>
      <Button icon negative onClick={() => onDeleteUser(user)}>
        <Icon name="close" />
      </Button>
    </Table.Cell>
  );
}
