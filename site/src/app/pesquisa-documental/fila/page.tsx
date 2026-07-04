import { FilaPedidosWorkspace } from "@/components/organisms/fila-pedidos-workspace";

export const metadata = {
  title: "Fila de pedidos",
  robots: { index: false },
};

export default function FilaPage() {
  return <FilaPedidosWorkspace />;
}
