import React from 'react';
import { Card, Button } from 'react-bootstrap';

const UnterweisungEditor: React.FC = () => {
  return (
    <div>
      <h1>Unterweisung erstellen</h1>
      <Card>
        <Card.Body>
          <p>Hier können Unterweisungen erstellt und bearbeitet werden.</p>
          <Button variant="primary">Unterweisung generieren</Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnterweisungEditor;
