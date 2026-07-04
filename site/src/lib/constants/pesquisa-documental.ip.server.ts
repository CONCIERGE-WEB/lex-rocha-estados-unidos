import "server-only";

import { readFileSync, existsSync } from "fs";
import { join } from "path";

type IpConfig = {
  modeloOrganizacaoInterno: string;
  promptClassificadorTriagem: string;
  promptSistemaPesquisa: string;
};

let _ip: IpConfig | null = null;

function loadIp(): IpConfig {
  if (_ip) return _ip;
  const path = join(process.cwd(), "private", "pesquisa-documental.ip.json");
  if (!existsSync(path)) {
    throw new Error(
      "Crie private/pesquisa-documental.ip.json a partir de private/pesquisa-documental.ip.example.json"
    );
  }
  _ip = JSON.parse(readFileSync(path, "utf-8")) as IpConfig;
  return _ip;
}

export function getModeloOrganizacaoInterno(): string {
  return loadIp().modeloOrganizacaoInterno;
}

export function getPromptClassificadorTriagem(): string {
  return loadIp().promptClassificadorTriagem;
}

export function getPromptSistemaPesquisa(): string {
  return loadIp().promptSistemaPesquisa;
}
