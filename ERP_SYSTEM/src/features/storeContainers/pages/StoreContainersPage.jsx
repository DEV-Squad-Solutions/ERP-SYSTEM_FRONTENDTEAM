import React from "react";
import { useParams } from "react-router-dom";

export default function StoreContainersPage() {
  const { partyId } = useParams();
  return (
    <div>
      <h1>مخزن عبوات العميل رقم {partyId} </h1>
    </div>
  );
}
