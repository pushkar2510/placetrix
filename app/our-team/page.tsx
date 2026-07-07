"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
	ArrowRightIcon,
	GithubIcon,
	InstagramIcon,
	LinkedinIcon,
	MailIcon,
	MenuIcon,
	MoonIcon,
	SunIcon,
	XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import PlaceTrixLogo from "@/assets/placetrix.svg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/lib/supabase/profile";
import { getUserProfileAction } from "@/lib/supabase/profile";
import { buildStorageUrl } from "@/lib/storage";
import BorderGlow from "@/components/BorderGlow";

const Galaxy = dynamic(() => import("@/components/Galaxy"), {
	ssr: false,
	loading: () => (
		<div className="absolute inset-0 bg-transparent" aria-hidden="true" />
	),
});

const CONTENT = "mx-auto w-full max-w-6xl px-4 md:px-6";
const SECTION_Y = "py-14 md:py-20";

const NAV_SHELL =
	"border border-black/10 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-black/30";

const NAV_BUTTON =
	"border-black/10 bg-white/70 text-zinc-900 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

const AVATAR_SHELL =
	"size-8 shrink-0 border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5";

function useMounted() {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return mounted;
}

function useScrolled(threshold = 10) {
	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > threshold);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, [threshold]);

	return scrolled;
}

function Logo() {
	return (
		<div className="flex shrink-0 items-center justify-center">
			<Image
				src={PlaceTrixLogo}
				alt="PlaceTrix"
				width={24}
				height={24}
				className="size-6 dark:invert"
				priority
			/>
		</div>
	);
}

function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();

	const handleToggle = React.useCallback(() => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}, [resolvedTheme, setTheme]);

	return (
		<Button
			aria-label="Toggle theme"
			onClick={handleToggle}
			size="icon"
			variant="outline"
			className={cn("size-8 text-foreground [&_svg]:size-4.5", NAV_BUTTON)}
		>
			<SunIcon className="dark:hidden" />
			<MoonIcon className="hidden dark:block" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}

function UserAvatar({
	user,
	className,
}: {
	user: UserProfile;
	className?: string;
}) {
	const initials = React.useMemo(() => {
		return user.display_name
			? user.display_name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
			: user.email[0].toUpperCase();
	}, [user.display_name, user.email]);

	const avatarUrl = React.useMemo(() => {
		return buildStorageUrl("avatars", user.avatar_path);
	}, [user.avatar_path]);

	return (
		<Avatar className={cn(AVATAR_SHELL, className)}>
			<AvatarImage
				src={avatarUrl ?? undefined}
				alt={user.display_name || user.email}
				className="object-cover"
			/>
			<AvatarFallback className="text-xs font-medium">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

function AuthButtons({
	size,
}: {
	size: "sm" | "default";
}) {
	return (
		<>
			<Button size={size} variant="outline" className={NAV_BUTTON} asChild>
				<Link href="/auth/login">Sign In</Link>
			</Button>
			<Button size={size} asChild>
				<Link href="/auth/sign-up">Get Started</Link>
			</Button>
		</>
	);
}

function MobileNav({
	user,
	isLoading,
}: {
	user: UserProfile | null;
	isLoading?: boolean;
}) {
	const [open, setOpen] = React.useState(false);

	const toggleMenu = React.useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const closeMenu = React.useCallback(() => {
		setOpen(false);
	}, []);

	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeMenu();
		};

		if (open) {
			document.addEventListener("keydown", onKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
		};
	}, [open, closeMenu]);

	return (
		<div className="relative md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className={cn(NAV_BUTTON)}
				onClick={toggleMenu}
				size="icon"
				variant="outline"
			>
				{open ? <XIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
			</Button>

			{open && (
				<>
					<button
						aria-label="Close menu"
						className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
						onClick={closeMenu}
					/>

					<div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.25rem)] z-50 px-3">
						<div className="mx-auto w-full max-w-sm">
							<div
								id="mobile-menu"
								className={cn(
									"overflow-hidden rounded-2xl border p-3 shadow-xl",
									"border-black/10 bg-white/95 backdrop-blur-xl",
									"dark:border-white/10 dark:bg-neutral-950/95",
									"animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200"
								)}
							>
								<div className="mb-3 flex items-center justify-between px-1">
									<span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
										Menu
									</span>
									<ThemeToggle />
								</div>

								{isLoading ? (
									<div className="mb-3 flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]">
										<div className="size-10 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
										<div className="min-w-0 flex-1 space-y-2">
											<div className="h-4 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10" />
											<div className="h-3 w-32 animate-pulse rounded bg-black/10 dark:bg-white/10" />
										</div>
									</div>
								) : user ? (
									<Link
										href="/home"
										onClick={closeMenu}
										className="mb-3 flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]"
									>
										<UserAvatar user={user} className="size-10" />
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
												{user.display_name || "Your account"}
											</p>
											<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
												{user.email}
											</p>
										</div>
									</Link>
								) : (
									<div className="mb-3 grid grid-cols-2 gap-2">
										<Button variant="outline" className={cn("w-full", NAV_BUTTON)} asChild>
											<Link href="/auth/login" onClick={closeMenu}>
												Sign In
											</Link>
										</Button>
										<Button className="w-full" asChild>
											<Link href="/auth/sign-up" onClick={closeMenu}>
												Get Started
											</Link>
										</Button>
									</div>
								)}

								<div className="space-y-1">
									<a
										href="/#features"
										onClick={closeMenu}
										className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-zinc-800 hover:bg-black/[0.04] dark:text-zinc-100 dark:hover:bg-white/[0.06]"
									>
										<span>Features</span>
										<ArrowRightIcon className="size-4 opacity-60" />
									</a>

									<a
										href="/our-team#team"
										onClick={closeMenu}
										className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-zinc-800 hover:bg-black/[0.04] dark:text-zinc-100 dark:hover:bg-white/[0.06]"
									>
										<span>Our Team</span>
										<ArrowRightIcon className="size-4 opacity-60" />
									</a>

									<Link
										href="/help-center"
										onClick={closeMenu}
										className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-zinc-800 hover:bg-black/[0.04] dark:text-zinc-100 dark:hover:bg-white/[0.06]"
									>
										<span>Help Center</span>
										<ArrowRightIcon className="size-4 opacity-60" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

interface HeaderVisualProps {
	user: UserProfile | null;
	isLoading?: boolean;
}

function HeaderVisual({ user, isLoading }: HeaderVisualProps) {
	const scrolled = useScrolled(10);

	return (
		<header className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:pt-3">
			<div
				className={cn(
					"mx-auto w-full transition-all duration-300 ease-out",
					scrolled ? "max-w-5xl" : "max-w-6xl"
				)}
			>
				<div
					className={cn(
						"w-full transition-all duration-300 ease-out",
						scrolled
							? cn("rounded-full", NAV_SHELL, "md:rounded-full")
							: "rounded-full border-none bg-transparent shadow-none backdrop-blur-none md:rounded-none md:border-none md:bg-transparent md:shadow-none md:backdrop-blur-none"
					)}
				>
					<nav
						className={cn(
							"flex w-full items-center justify-between px-4 transition-[height,padding] duration-300 ease-out",
							scrolled ? "h-14 md:h-12" : "h-14 md:h-14"
						)}
					>
						<Link
							href="/"
							className="flex items-center gap-2 font-bold tracking-[0.05em]"
						>
							<Logo />
							<span className="pl-1 text-lg font-bold tracking-wider text-zinc-950 dark:text-white">
								PlaceTrix
							</span>
						</Link>

						<div className="hidden items-center gap-2 md:flex">
							<ThemeToggle />
							{isLoading ? (
								<div className="size-8 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
							) : user ? (
								<UserAvatar user={user} />
							) : (
								<AuthButtons size="sm" />
							)}
						</div>

						<MobileNav user={user} isLoading={isLoading} />
					</nav>
				</div>
			</div>
		</header>
	);
}

function HeaderShell({
	initialUser = null,
}: {
	initialUser?: UserProfile | null;
}) {
	const [user, setUser] = React.useState<UserProfile | null>(initialUser);
	const [isFetching, setIsFetching] = React.useState(false);
	const mounted = useMounted();

	React.useEffect(() => {
		let cancelled = false;

		if (initialUser) {
			setUser(initialUser);
			return;
		}

		const hasAuthCookie =
			typeof document !== "undefined" &&
			(document.cookie.includes("auth-token") || document.cookie.includes("sb-"));

		if (!hasAuthCookie) return;

		setIsFetching(true);
		getUserProfileAction()
			.then((data) => {
				if (!cancelled && data) setUser(data);
			})
			.catch(() => { })
			.finally(() => {
				if (!cancelled) setIsFetching(false);
			});

		return () => {
			cancelled = true;
		};
	}, [initialUser]);

	const isLoading = !mounted || isFetching;

	return <HeaderVisual user={user} isLoading={isLoading} />;
}

type TeamMember = {
	name: string;
	role: string;
	image?: string | null;
	email?: string;
	linkedin?: string;
	github?: string;
	behance?: string;
};


const TEAM: TeamMember[] = [
	{
		name: "Shabbir Ezzy",
		image: "https://supabase.placetrix.app/storage/v1/object/public/landing-page-material/team-members/ShabbirEzzy.png",
		role: "Lead Product Developer",
		email: "ezzyshabbir05@gmail.com",
		linkedin: "https://www.linkedin.com/in/ezzyshabbir05",
		github: "https://github.com/ezzyshabbir05",
	},
	{
		name: "Sidra Chaudhari",
		image: "https://supabase.placetrix.app/storage/v1/object/public/landing-page-material/team-members/SidraChaudhari.png",
		role: "UI/UX Designer",
		email: "sidrasc05@gmail.com",
		linkedin: "https://www.linkedin.com/in/sidra-chaudhari",
		github: "https://github.com/sidrachaudhari",
	},
	{
		name: "Pushkar Gaikwad",
		image: "https://supabase.placetrix.app/storage/v1/object/public/landing-page-material/team-members/PushkarGaikwad.png",
		role: "Software Engineer",
		email: "pushkargaikwad25@gmail.com",
		linkedin: "https://www.linkedin.com/in/pushkar2510/",
		github: "https://github.com/pushkar2510",
	},
	{
		name: "Vishal Raut",
		image: "https://supabase.placetrix.app/storage/v1/object/public/landing-page-material/team-members/VishalRaut.png",
		role: "Software Engineer",
		email: "vishalraut.contact@gmail.com",
		linkedin: "https://www.linkedin.com/in/vishalraut2106",
		github: "https://github.com/vishalraut2106",
	},
	{
		name: "Vaishnavi Dharam",
		image: "https://supabase.placetrix.app/storage/v1/object/public/landing-page-material/team-members/VaishnaviDharam.png",
		role: "UI/UX Designer",
		email: "vaishnavidharam5@gmail.com",
		linkedin: "https://www.linkedin.com/in/vaishnavidharam511",
		behance: "https://www.behance.net/vaishnavidharam5",
	},
];

function MissionSection() {
	return (
		<section
			className={cn(
				"bg-white text-zinc-950 dark:bg-black dark:text-white",
				SECTION_Y
			)}
		>
			<div className={CONTENT}>
				<article className="rounded-3xl border border-black/10 bg-white/95 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] md:p-8 lg:p-10">
					<div className="max-w-4xl">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
							Why we exist
						</p>

						<h2
							className="font-cirka mt-2 text-balance text-3xl font-semibold tracking-tight md:text-5xl"
						>
							Built around the real pressure students face.
						</h2>

						<div className="mt-5 space-y-4 text-sm leading-7 text-stone-600 dark:text-stone-300 md:text-base md:leading-8">
							<p>
								Placement preparation is often fragmented across mock tests,
								aptitude practice, interview preparation, campus drive updates,
								and eligibility rules. Students usually end up switching between
								scattered resources, outdated information, and disconnected
								workflows at the exact moment they need clarity the most.
							</p>

							<p>
								PlaceTrix was created to bring that journey into one focused
								system. Instead of forcing students to manage preparation across
								multiple tabs, platforms, and informal groups, we want to give
								them a cleaner way to practise consistently, understand their
								progress, and prepare with direction.
							</p>

							<p>
								Our goal is not just to provide more tests or more features. It
								is to build a product that feels useful every day: something
								that helps students identify weak areas, stay aware of upcoming
								opportunities, and spend more time improving rather than trying
								to figure out what to do next.
							</p>

							<p>
								We care deeply about simplicity, trust, and practical value.
								Every part of the platform is shaped around reducing noise,
								improving visibility, and making preparation feel structured
								instead of overwhelming.
							</p>
						</div>
					</div>
				</article>
			</div>
		</section>
	);
}
function TeamMemberCard({
	member,
	glowEnabled,
}: {
	member: TeamMember;
	glowEnabled: boolean;
}) {
	return (
		<BorderGlow
			className="group h-full rounded-3xl"
			glowColor="0 0% 100%"
			backgroundColor="transparent"
			borderRadius={24}
			glowRadius={glowEnabled ? 14 : 0}
			glowIntensity={glowEnabled ? 1.2 : 0}
			fillOpacity={glowEnabled ? 0.08 : 0}
			coneSpread={glowEnabled ? 14 : 0}
		>
			<article className="h-full rounded-3xl bg-white/95 p-4 backdrop-blur-sm transition-all duration-300 dark:bg-white/[0.03] md:p-5">
				<div className="flex h-full flex-col">
					<div className="relative mb-4 overflow-hidden rounded-2xl bg-black/[0.04] aspect-[1/1] dark:bg-white/[0.05]">
						{member.image ? (
							<Image
								src={member.image}
								alt={member.name}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
							/>
						) : (
							<div className="flex h-full items-center justify-center text-lg font-semibold text-zinc-500 dark:text-zinc-400">
								{member.name}
							</div>
						)}
					</div>

					<div className="flex-1 px-1">
						<h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-white">
							{member.name}
						</h3>
						<p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
							{member.role}
						</p>
					</div>

					<div className="mt-5 flex flex-wrap gap-2 px-1">
						{member.email ? (
							<Button variant="outline" size="sm" className={NAV_BUTTON} asChild>
								<a href={`mailto:${member.email}`}>
									<MailIcon className="size-3" />
									Contact
								</a>
							</Button>
						) : null}

						{member.linkedin ? (
							<Button variant="outline" size="icon" className={NAV_BUTTON} asChild>
								<a
									href={member.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${member.name} LinkedIn`}
								>
									<LinkedinIcon className="size-4" />
								</a>
							</Button>
						) : null}

						{member.github ? (
							<Button variant="outline" size="icon" className={NAV_BUTTON} asChild>
								<a
									href={member.github}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${member.name} GitHub`}
								>
									<GithubIcon className="size-4" />
								</a>
							</Button>
						) : null}

						{member.behance ? (
							<Button variant="outline" size="icon" className={NAV_BUTTON} asChild>
								<a
									href={member.behance}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${member.name} Behance`}
								>
									<BehanceIcon className="size-4" />
								</a>
							</Button>
						) : null}
					</div>
				</div>
			</article>
		</BorderGlow>
	);
}
function TeamSection() {
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();
	const glowEnabled = mounted && resolvedTheme === "dark";

	return (
		<section
			id="team"
			className={cn(
				"scroll-mt-24 bg-white text-zinc-950 dark:bg-black dark:text-white md:scroll-mt-20",
				"pt-24 md:pt-28"
			)}
		>
			<div className="mx-auto w-full max-w-7xl px-4 md:px-6">
				<div className="mx-auto max-w-3xl text-center">
					<p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
						The team
					</p>
					<h2
						className="font-cirka text-balance text-3xl font-semibold tracking-tight md:text-5xl"
					>
						Small team, focused execution
					</h2>
					<p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300 md:text-base md:leading-8">
						We care about reliable product quality, thoughtful preparation
						flows, and giving students a better system to grow through.
					</p>
				</div>
				<div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
					{TEAM.map((member) => (
						<TeamMemberCard
							key={`${member.name}-${member.role}`}
							member={member}
							glowEnabled={glowEnabled}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function CTASection() {
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();
	const showGalaxy = mounted && resolvedTheme === "dark";

	return (
		<section className="w-full bg-white pb-14 text-zinc-950 dark:bg-black dark:text-white md:pb-20">
			<div className={CONTENT}>
				<div className="relative overflow-hidden rounded-2xl border border-zinc-300/80 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02] md:px-10 md:py-14">
					{showGalaxy && (
						<div className="absolute inset-0 z-0 hidden opacity-40 dark:opacity-70 lg:block">
							<Galaxy
								density={0.7}
								glowIntensity={0.2}
								saturation={0}
								hueShift={140}
								mouseInteraction={false}
								twinkleIntensity={0}
								rotationSpeed={0.02}
								autoCenterRepulsion={0}
								starSpeed={0.2}
								speed={0.5}
							/>
						</div>
					)}

					<div className="pointer-events-none absolute inset-0 z-10 bg-white/70 dark:bg-black/45" />

					<div className="relative z-20 mx-auto max-w-2xl">
						<p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
							Join us
						</p>
						<h2
							className="font-cirka text-balance text-3xl font-semibold tracking-tight md:text-5xl"
						>
							Start your placement preparation with confidence.
						</h2>
						<p className="mx-auto mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300 md:text-base md:leading-8">
							Explore mock tests, progress tracking, and preparation tools
							designed to keep students one step ahead.
						</p>
						<div className="mt-6 flex items-center justify-center">
							<Button size="lg" className="rounded-full font-medium" asChild>
								<Link href="/auth/sign-up">Get Started</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const company = [
	{ title: "Our Team", href: "/our-team" },
	{ title: "Privacy Policy", href: "/privacy-policy" },
	{ title: "Terms of Service", href: "/terms-of-service" },
];

const resources = [
	{ title: "Pricing", href: "/pricing" },
	{ title: "Help Center", href: "/help-center" },
];

const socialLinks = [
	{
		icon: <LinkedinIcon />,
		link: "https://www.linkedin.com/company/360-view-tech/",
	},
	{
		icon: <InstagramIcon />,
		link: "https://www.instagram.com/360viewtech/",
	},
	{
		icon: <GithubIcon />,
		link: "https://github.com/360viewtech",
	},
];

function Footer() {
	return (
		<footer className="relative">
			<div className="mx-auto max-w-6xl">
				<div className="grid max-w-6xl grid-cols-6 gap-6 p-4">
					<div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
						<Link className="font-bold text-zinc-950 dark:text-white" href="/">
							PlaceTrix
						</Link>
						<p className="max-w-sm text-balance text-sm text-zinc-500 dark:text-zinc-400">
							Train. Track. Triumph.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((item, index) => (
								<Button
									asChild
									key={`social-${item.link}-${index}`}
									size="icon-sm"
									variant="outline"
								>
									<a
										href={item.link}
										target="_blank"
										rel="noopener noreferrer"
									>
										{item.icon}
									</a>
								</Button>
							))}
						</div>
					</div>

					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-xs text-zinc-500 dark:text-zinc-400">
							Resources
						</span>
						<div className="mt-2 flex flex-col gap-2">
							{resources.map(({ href, title }) => (
								<a
									className="w-max text-sm text-zinc-700 hover:underline dark:text-zinc-300"
									href={href}
									key={title}
								>
									{title}
								</a>
							))}
						</div>
					</div>

					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-xs text-zinc-500 dark:text-zinc-400">
							Company
						</span>
						<div className="mt-2 flex flex-col gap-2">
							{company.map(({ href, title }) => (
								<a
									className="w-max text-sm text-zinc-700 hover:underline dark:text-zinc-300"
									href={href}
									key={title}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="absolute inset-x-0 h-px w-full bg-border" />
				<div className="flex flex-col justify-between gap-2 py-4">
					<p className="text-center text-sm font-light text-zinc-500 dark:text-zinc-400">
						&copy; {new Date().getFullYear()}, 4 Grid Technologies, All rights reserved
					</p>
				</div>
			</div>
		</footer>
	);
}

function BehanceIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			fill="currentColor"
			viewBox="0 0 16 16"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M4.654 3c.461 0 .887.035 1.278.14.39.07.711.216.996.391s.497.426.641.747c.14.32.216.711.216 1.137 0 .496-.106.922-.356 1.242-.215.32-.566.606-.997.817.606.176 1.067.496 1.348.922s.461.957.461 1.563c0 .496-.105.922-.285 1.278a2.3 2.3 0 0 1-.782.887c-.32.215-.711.39-1.137.496a5.3 5.3 0 0 1-1.278.176L0 12.803V3zm-.285 3.978c.39 0 .71-.105.957-.285.246-.18.355-.497.355-.887 0-.216-.035-.426-.105-.567a1 1 0 0 0-.32-.355 1.8 1.8 0 0 0-.461-.176c-.176-.035-.356-.035-.567-.035H2.17v2.31c0-.005 2.2-.005 2.2-.005zm.105 4.193c.215 0 .426-.035.606-.07.176-.035.356-.106.496-.216s.25-.215.356-.39c.07-.176.14-.391.14-.641 0-.496-.14-.852-.426-1.102-.285-.215-.676-.32-1.137-.32H2.17v2.734h2.305zm6.858-.035q.428.427 1.278.426c.39 0 .746-.106 1.032-.286q.426-.32.53-.64h1.74c-.286.851-.712 1.457-1.278 1.848-.566.355-1.243.566-2.06.566a4.1 4.1 0 0 1-1.527-.285 2.8 2.8 0 0 1-1.137-.782 2.85 2.85 0 0 1-.712-1.172c-.175-.461-.25-.957-.25-1.528 0-.531.07-1.032.25-1.493.18-.46.426-.852.747-1.207.32-.32.711-.606 1.137-.782a4 4 0 0 1 1.493-.285c.606 0 1.137.105 1.598.355.46.25.817.532 1.102.958.285.39.496.851.641 1.348.07.496.105.996.07 1.563h-5.15c0 .58.21 1.11.496 1.396m2.24-3.732c-.25-.25-.642-.391-1.103-.391-.32 0-.566.07-.781.176s-.356.25-.496.39a.96.96 0 0 0-.25.497c-.036.175-.07.32-.07.46h3.196c-.07-.526-.25-.882-.497-1.132zm-3.127-3.728h3.978v.957h-3.978z" />
		</svg>
	);
}

export default function OurTeamPage() {
	return (
		<div
			suppressHydrationWarning
			className="select-none relative flex min-h-screen flex-col overflow-hidden bg-white text-zinc-950 supports-[overflow:clip]:overflow-clip dark:bg-black dark:text-white"
		>
			<HeaderShell />
			<main className="flex flex-col">
				<TeamSection />
				<MissionSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
