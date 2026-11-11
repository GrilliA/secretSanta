import type { Messages } from './it.ts';

/** Textos en español (España). Misma forma que `it.ts`: TypeScript avisa si falta algo. */
export const es: Messages = {
	locale: 'es',
	intlLocale: 'es-ES',
	languageName: 'Español',

	common: {
		add: 'Añadir',
		wait: 'Un momento…',
		budget: 'Presupuesto',
		exchangeOn: (day: string) => `Intercambio el ${day}`,
		people: (n: number) => (n === 1 ? '1 persona' : `${n} personas`),
		wishes: (n: number) => (n === 1 ? '1 deseo' : `${n} deseos`),
		nobodySees: 'Nadie, ni siquiera tú, verá las parejas.'
	},

	home: {
		title: 'Amigo Invisible',
		eyebrow: 'Navidad 2026',
		headline: 'El intercambio de regalos, ',
		headlineEm: 'sin papelitos.',
		intro:
			'Crea el evento, añade a la familia y envía las invitaciones por email. Cada uno escribe su lista de deseos y descubre en secreto a quién le toca hacer el regalo.',
		steps: ['Crea el evento', 'Listas de deseos', 'Sortea y envía los sobres'],
		stepOf: (n: number) => `Paso ${n} de 3`,
		formTitle: 'Tu evento',
		eventName: 'Nombre del evento',
		eventNameDefault: 'Navidad en familia',
		exchangeDate: 'Fecha del intercambio',
		budgetPlaceholder: 'p. ej. 30 €',
		message: 'Mensaje para todos',
		optional: '(opcional)',
		yourName: 'Tu nombre',
		yourEmail: 'Tu email',
		language: 'Idioma de las invitaciones',
		plays: 'Yo también participo',
		playsHint: 'No verás las parejas de los demás',
		submit: 'Siguiente: añadir participantes',
		submitting: 'Creando el evento…',
		switchTo: 'Cambiar idioma'
	},

	admin: {
		pageTitle: (name: string) => `Gestionar · ${name}`,
		stepOf: (n: number) => `Paso ${n} de 3`,
		back: 'Crear otro evento',
		titleDrawn: '¡Invitaciones enviadas!',
		title: '¿Quién participa?',
		created: '¡Evento creado!',
		yourLink: 'Tu enlace de gestión',
		saveLink: (email: string) =>
			`Guarda este enlace: es la única forma de gestionar el evento. También te lo hemos enviado a ${email}.`,
		linkLabel: 'Enlace de gestión',
		copy: 'Copiar',
		copied: '¡Copiado!',
		participants: 'Participantes',
		openedCount: (n: number) => ` · ${n} han abierto el sobre`,
		readyCount: (n: number) => ` · ${n} listas terminadas`,
		organizer: '· organizador',
		managedBy: (name: string) => `Gestionado por ${name} · email aparte`,
		status: {
			opened: 'Sobre abierto',
			sent: 'Sobre enviado',
			notSent: 'No enviado',
			ready: 'Lista terminada',
			writing: 'Escribiendo la lista'
		},
		changePhoto: 'Cambiar foto',
		addPhoto: 'Añadir foto',
		photoInputLabel: (has: boolean, name: string) =>
			`${has ? 'Cambiar' : 'Añadir'} la foto de ${name}`,
		photo: 'Foto',
		photoOptional: 'opcional',
		photoError: 'No puedo leer esta imagen: prueba con otra foto.',
		resend: 'Reenviar',
		resendLabel: (name: string) => `Reenviar la invitación a ${name}`,
		remove: (name: string) => `Quitar a ${name}`,
		empty: 'Todavía no hay nadie. Añade a la primera persona aquí abajo.',
		name: 'Nombre',
		namePlaceholder: 'p. ej. Sara',
		inviteGoesTo: 'La invitación llega a',
		ownEmail: 'A su email',
		managerOption: (name: string) => `${name} (gestiona la invitación)`,
		email: 'Email',
		emailPlaceholder: 'puede ser la misma de otro participante',
		exclusions: 'Exclusiones',
		exclusionsHint: 'Parejas que no pueden tocarse entre sí.',
		removeExclusion: (a: string, b: string) => `Quitar exclusión ${a} y ${b}`,
		firstPerson: 'Primera persona',
		secondPerson: 'Segunda persona',
		person: 'Persona…',
		done: '¡Hecho!',
		doneText:
			'Cada uno ha recibido su enlace secreto. Si alguien no encuentra el email, usa “Reenviar”.',
		sentReport: (sent: number, failed: string[]) =>
			`Enviados ${sent} emails${failed.length ? `; fallidos: ${failed.join(', ')}` : ''}.`,
		nobodyCanSee: 'Nadie, ni siquiera tú, puede ver las parejas.',
		step1: '1. Listas de deseos',
		step1Hint: 'Cada uno recibe un email para escribir su lista.',
		readyMeterLabel: 'Listas terminadas',
		readyOf: (ready: number, total: number) => `${ready} de ${total}`,
		readySuffix: ' listas terminadas.',
		allDone: '¡Todos han terminado!',
		willNotify: 'Te enviaremos un email cuando todos hayan terminado.',
		inviteNew: (n: number) =>
			n === 1 ? 'Invitar a la persona nueva' : `Invitar a las ${n} personas nuevas`,
		inviteAll: (n: number) =>
			n === 1 ? 'Enviar 1 invitación para la lista' : `Enviar ${n} invitaciones para la lista`,
		step2: '2. Sorteo',
		drawButton: 'Sortear y enviar los sobres',
		needThree: 'Hacen falta al menos 3 personas.',
		confirmMissing: (n: number) =>
			n === 1
				? '1 persona todavía no ha terminado su lista. '
				: `${n} personas todavía no han terminado su lista. `,
		confirmDraw: (n: number) =>
			`¿Sortear y enviar ${n} sobres? Después ya no podrás cambiar los participantes.`,
		video: {
			title: 'Vídeo de bienvenida',
			hint: 'Se reproduce a pantalla completa cuando cada uno abre su invitación y luego deja paso a la página. Un vídeo corto (10–30 segundos) es perfecto, también con música.',
			desktop: 'Para ordenador',
			desktopHint: 'Horizontal',
			mobile: 'Para móvil',
			mobileHint: 'Vertical · opcional: si no hay, el móvil usa el del ordenador',
			choose: 'Elegir un vídeo',
			change: 'Cambiar vídeo',
			remove: 'Quitar',
			uploading: (pct: number) => `Subiendo… ${pct}%`,
			saving: 'Guardando…',
			limits: 'MP4, WebM o MOV · máximo 40 MB',
			tooBig: 'El vídeo es demasiado grande: máximo 40 MB.',
			format: 'Formato no admitido: usa MP4, WebM o MOV.',
			unreadable: 'No puedo leer este vídeo: prueba con otro archivo.',
			failed: 'No se ha podido subir. Inténtalo de nuevo.',
			unavailable: 'La subida de vídeos no está configurada.',
			preview: 'Vista previa del vídeo'
		},
		music: {
			title: 'Música de fondo',
			hint: 'Suena mientras cada uno mira su invitación (después del vídeo, si lo hay). Quien la abre siempre puede apagarla.',
			choose: 'Elige una canción',
			change: 'Cambiar canción',
			remove: 'Quitar',
			uploading: (pct: number) => `Subiendo… ${pct}%`,
			saving: 'Guardando…',
			limits: 'MP3, M4A, OGG o WAV · máximo 15 MB',
			tooBig: 'El archivo es demasiado grande: máximo 15 MB.',
			format: 'Formato no admitido: usa MP3, M4A, OGG o WAV.',
			failed: 'No se pudo subir. Inténtalo de nuevo.',
			unavailable: 'La subida de música no está configurada.',
			preview: 'Escuchar la música'
		},
		spotify: {
			label: 'O una canción de Spotify',
			placeholder: 'Pega el enlace o el código de «Compartir → Insertar»',
			hint: 'Arranca junto con el vídeo de bienvenida (si el navegador no lo permite, al primer toque) y sustituye a la canción subida. Sin cuenta de Spotify se oye un avance de 30 segundos.',
			save: 'Conectar',
			remove: 'Quitar'
		}
	},

	invite: {
		pageTitle: (event: string) => `Tu Amigo Invisible · ${event}`,
		viewingFor: (name: string) => `Estás viendo la invitación de ${name}`,
		hello: (name: string) => `¡Hola, ${name}!`,
		readyTitle: 'Tu lista está lista. ¡Ahora toca esperar el sobre!',
		readyText: (organizer: string) =>
			`Cuando todos hayan terminado, ${organizer} hará el sorteo y te llegará un email para descubrir a quién le haces el regalo. Todavía puedes cambiar tu lista aquí abajo.`,
		writeTitle: '¿Qué te gustaría encontrar bajo el árbol?',
		writeText:
			'Escribe aquí abajo tu lista de deseos: solo la verá quien te haga el regalo. Cuando termines, pulsa “Mi lista está lista”.',
		envelopeFor: (name: string) => `${name}, hay un sobre para ti`,
		open: 'Abrir el sobre',
		youGiftTo: (name: string) => `Hola, ${name}: este año le haces el regalo a…`,
		reopen: 'Volver a abrir el sobre',
		wishesOf: (name: string) => `Los deseos de ${name}`,
		noWishes: 'No ha escrito ningún deseo: ¡echa mano de la imaginación!',
		secret: (name: string) => `Shh… es un secreto: ¡no se lo digas a ${name}!`,
		ownTitle: 'Tu lista de deseos',
		ownTitleManaged: (name: string) => `La lista de ${name}`,
		ownHint: 'Solo la ve quien te hace el regalo.',
		ownHintManaged: (name: string) =>
			`Solo la ve quien le hace el regalo a ${name}. La rellenas tú por esa persona.`,
		removeWish: (w: string) => `Quitar ${w}`,
		addWish: 'Añadir un deseo',
		addWishPlaceholder: 'Añade un deseo…',
		ready: 'Lista terminada',
		notReady: 'Todavía quiero añadir algo',
		markReady: 'Mi lista está lista',
		needOne: 'Añade al menos un deseo.',
		edit: 'Editar',
		envelopeLetter: 'Este año le haces el regalo a…',
		playersTitle: 'Quién juega este año',
		playersReady: (ready: number, total: number) =>
			ready === total
				? '¡Todas las listas están terminadas!'
				: `${ready} de ${total} han terminado su lista`,
		playersCount: (n: number) => (n === 1 ? '1 persona' : `${n} personas`),
		you: 'Tú',
		readyBadge: 'lista terminada',
		photoOf: (name: string) => `Foto de ${name}`,
		introLabel: 'Vídeo de bienvenida',
		skipIntro: 'Saltar',
		soundOn: 'Activar sonido',
		soundOff: 'Quitar sonido',
		replayIntro: 'Ver otra vez el vídeo',
		musicOn: 'Poner la música',
		musicOff: 'Apagar la música',
		soundtrack: 'La banda sonora'
	},

	email: {
		subjects: {
			wishlist: 'Escribe tu lista de deseos',
			wishlistManaged: (name: string) => `Escribe la lista de deseos de ${name}`,
			draw: 'Tu Amigo Invisible',
			drawManaged: (name: string) => `El Amigo Invisible de ${name}`,
			admin: (event: string) => `Gestiona “${event}”`,
			allReady: 'Todas las listas están listas: ¡ya puedes hacer el sorteo!'
		},
		managedNotice: (name: string, manager: string) =>
			`Este email es para ${name}. Lo recibes tú, ${manager}, porque gestionas su invitación.`,
		managedNoticeDraw: ' Tu propia pareja llega en otro email.',
		managedNoticeWishlist: ' Escribe tú su lista de deseos.',
		exchangeDate: 'Fecha del intercambio',
		budget: 'Presupuesto',
		wishlist: {
			title: (name: string) => `${name}, ¿qué te gustaría`,
			titleEm: 'encontrar bajo el árbol?',
			body: 'Antes del sorteo, escribe tu lista de deseos: solo la verá quien te haga el regalo. Cuando termines, pulsa',
			bodyButton: '“Mi lista está lista”',
			cta: 'Escribir la lista de deseos',
			footnote: 'Cuando todos hayan terminado, recibirás otro email con el sobre para abrir.',
			text: (event: string) => `Escribe tu lista de deseos para ${event}`
		},
		draw: {
			title: (name: string) => `${name}, ¡ya tienes tu`,
			titleEm: 'Amigo Invisible!',
			body: 'Abre el enlace para descubrir a quién le haces el regalo y leer su lista de deseos.',
			cta: 'Descubre quién te ha tocado',
			footnote: 'El enlace es personal: no lo reenvíes o se acaba la sorpresa.',
			text: (name: string, event: string) => `${name}, ¡ya tienes tu Amigo Invisible de ${event}!`
		},
		personalLink: 'El enlace es personal: no lo reenvíes.',
		admin: {
			title: (name: string) => `Hola, ${name}: ¡tu Amigo Invisible está listo!`,
			body: 'Desde este enlace añades a los participantes, envías las invitaciones para la lista de deseos y luego haces el sorteo de',
			body2: 'Guárdalo: es la única forma de gestionar el evento.',
			cta: 'Gestionar el evento',
			footnote: 'Tranquilo: desde aquí no podrás ver a quién le ha tocado quién.',
			text: (name: string, event: string, link: string) =>
				`Hola, ${name}: tu Amigo Invisible "${event}" está listo.\nGestiónalo desde aquí (guarda el enlace): ${link}`
		},
		allReady: {
			title: (name: string) => `Hola, ${name}: ¡es hora del`,
			titleEm: 'sorteo!',
			body: (n: number) =>
				`Las ${n} personas han escrito su lista de deseos. Abre la página del evento y pulsa`,
			bodyButton: '“Sortear y enviar los sobres”',
			body2: 'cada uno recibirá su sobre.',
			cta: 'Ir al sorteo',
			footnote: 'Nadie, ni siquiera tú, verá las parejas.',
			text: (event: string, n: number, link: string) =>
				`Todas las listas de "${event}" están listas (${n} personas).\nHaz el sorteo desde aquí: ${link}`
		}
	},

	errors: {
		required: (label: string) => `${label}: campo obligatorio.`,
		tooLong: (label: string, max: number) => `${label}: máximo ${max} caracteres.`,
		invalidEmail: 'Email no válido.',
		eventNotFound: 'Evento no encontrado.',
		alreadyDrawnLocked: 'El sorteo ya se ha hecho: ya no se puede modificar.',
		alreadyDrawn: 'El sorteo ya se ha hecho.',
		managerNotInEvent: 'Quien gestiona la invitación no forma parte del evento.',
		managerIsManaged: (name: string) => `La invitación de ${name} ya la gestiona otra persona.`,
		participantNotFound: 'Participante no encontrado.',
		samePerson: 'Elige dos personas distintas.',
		invalidPeople: 'Personas no válidas.',
		noParticipants: 'Primero añade algún participante.',
		inviteNotFound: 'Invitación no encontrada.',
		maxWishes: (n: number) => `Máximo ${n} deseos.`,
		photoTooBig: 'La foto es demasiado grande (máx. 1,5 MB).',
		photoFormat: 'Formato no admitido: usa una foto JPG, PNG o WebP.',
		photoMissing: 'Elige una foto.',
		missingParticipant: 'Falta el participante.',
		allInvited: 'Todos han recibido ya la invitación.',
		needThree: 'Hacen falta al menos 3 participantes.',
		drawImpossible: 'No se puede completar el sorteo con estas exclusiones.',
		videoInvalid: 'Vídeo no válido: vuelve a subirlo.',
		videoMissing: 'Elige un vídeo.',
		videoTooBig: 'El vídeo es demasiado grande: máximo 40 MB.',
		videoFormat: 'Formato no admitido: usa MP4, WebM o MOV.',
		videoPoster: 'Vista previa del vídeo no válida.',
		musicInvalid: 'Música no válida: vuelve a subirla.',
		musicMissing: 'Elige una canción.',
		musicTooBig: 'El archivo es demasiado grande: máximo 15 MB.',
		musicFormat: 'Formato no admitido: usa MP3, M4A, OGG o WAV.',
		spotifyInvalid: 'Enlace de Spotify no válido: pega el enlace de una canción, álbum o lista.',
		labels: {
			yourName: 'Tu nombre',
			eventName: 'Nombre del evento',
			name: 'Nombre',
			wish: 'Deseo'
		}
	},

	notFound: {
		title: 'Vaya, aquí no hay nada',
		invite: 'Esta invitación no existe. Comprueba que has copiado el enlace completo del email.',
		event: 'Este evento no existe. Comprueba que has copiado el enlace completo.',
		generic: 'La página que buscas no existe.',
		home: 'Volver al inicio'
	}
};
