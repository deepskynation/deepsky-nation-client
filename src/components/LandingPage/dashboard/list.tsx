"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { dashboardHeaderMenuItems } from "@/components/layout/HeaderMenuItems";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import { ProductCard } from "@/components/LandingPage/dashboard/modules/product-card";
import { AnimateInView } from "@/components/LandingPage/dashboard/modules/animate-in-view";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import {
  glassCardClassName,
  glassHeaderClassName,
} from "@/lib/glass-styles";
import { pickFeaturedProducts } from "@/lib/user-dashboard-products";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchDashboardFeaturedProducts,
  selectDashboardFeaturedProducts,
  selectDashboardFeaturedProductsError,
  selectDashboardFeaturedProductsStatus,
} from "@/store/slices/productSlice";
import { AboutUsSection } from "@/components/LandingPage/dashboard/modules/about-us";
import { ContactUsSection } from "@/components/LandingPage/dashboard/modules/contact-us";
import { FooterSection } from "@/components/LandingPage/dashboard/modules/footer";
import { ModelCarousel } from "@/components/LandingPage/dashboard/modules/model-carousel";

const LANDING_FEATURED_LIMIT = 10;

export default function DashboardList() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const featuredProducts = useAppSelector(selectDashboardFeaturedProducts);
  const featuredProductsStatus = useAppSelector(selectDashboardFeaturedProductsStatus);
  const featuredProductsError = useAppSelector(selectDashboardFeaturedProductsError);
  const [activeHash, setActiveHash] = useState("");

  const displayedProducts = pickFeaturedProducts(featuredProducts, LANDING_FEATURED_LIMIT);
  const isFeaturedLoading =
    featuredProductsStatus === "loading" && displayedProducts.length === 0;

  const navItems = dashboardHeaderMenuItems.filter((item) => !item.children);
  const authItem = dashboardHeaderMenuItems.find(
    (item) => item.children?.length,
  );
  const authLinks = authItem?.children ?? [];

  const isLandingPage = pathname === "/" || pathname === "/dashboard";

  const isActive = (href?: string) => {
    if (!href || !isLandingPage) return false;

    if (href === "/" || href === "/dashboard") {
      return activeHash === "";
    }

    const hash = href.includes("#") ? href.split("#")[1] : "";
    if (hash) {
      return activeHash === hash;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    void dispatch(
      fetchDashboardFeaturedProducts({
        page: 1,
        page_size: LANDING_FEATURED_LIMIT,
        featured: true,
        include_gallery_images: true,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash.slice(1));

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "products" || hash === "about-us" || hash === "contact-us") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      setActiveHash(hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <header className={glassHeaderClassName}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="hidden items-center gap-5 py-5 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              className="justify-self-start text-lg transition-opacity hover:opacity-70 md:text-xl"
            >
              <span className="font-bold uppercase tracking-[0.22em]">
                DeepSky
              </span>
            </Link>

            <nav className="flex items-center justify-center gap-x-9">
              {navItems.map((item) => (
                <HeaderNavLink
                  key={item.id}
                  item={item}
                  variant="minimal"
                  showIcon={false}
                  active={isActive(item.href)}
                  onHashNavigate={setActiveHash}
                />
              ))}
            </nav>

            <div className="flex items-center justify-end gap-9">
              {authLinks.map((item) => (
                <HeaderNavLink
                  key={item.id}
                  item={item}
                  variant="minimal"
                  showIcon={false}
                />
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <div className="py-4">
              <Link
                href="/"
                className="text-lg transition-opacity hover:opacity-70"
              >
                <span className="font-bold uppercase tracking-[0.22em]">
                  DeepSky
                </span>
              </Link>
            </div>

            <div className="-mx-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 scrollbar-hide">
              <nav className="flex w-max min-w-full items-center gap-x-6 px-6">
                {navItems.map((item) => (
                  <HeaderNavLink
                    key={item.id}
                    item={item}
                    variant="minimal"
                    showIcon={false}
                    active={isActive(item.href)}
                    onHashNavigate={setActiveHash}
                    className="shrink-0 whitespace-nowrap"
                  />
                ))}
                {authLinks.map((item) => (
                  <HeaderNavLink
                    key={item.id}
                    item={item}
                    variant="minimal"
                    showIcon={false}
                    className="shrink-0 whitespace-nowrap"
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* MODEL SHOWCASE — full-width carousel (reference: hero image strip) */}
      <section className="relative w-full border-b border-white/5 bg-model-carousel">
        <ModelCarousel variant="banner" />
      </section>

      {/* HOME SECTION */}
      <DashboardGlassSection variant="hero">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-center">
            <div
              className={cn(
                glassCardClassName,
                "mx-auto w-full max-w-lg space-y-7 p-7 sm:p-8 lg:mx-0 lg:space-y-9",
              )}
            >
              <div className="space-y-5">
                <p
                  className="animate-hero-fade-up text-[11px] uppercase tracking-[0.32em] text-black/45"
                  style={{ animationDelay: "0ms" }}
                >
                  New Arrivals
                </p>
                <h1
                  className="animate-hero-fade-up font-serif text-[2.35rem] leading-[1.08] font-normal text-black sm:text-5xl lg:text-[3.35rem]"
                  style={{ animationDelay: "100ms" }}
                >
                  Explore DeepSky
                  <br />
                  Style
                </h1>
              </div>

              <p
                className="animate-hero-fade-up max-w-sm text-base leading-relaxed text-black/60 md:text-[1.05rem]"
                style={{ animationDelay: "200ms" }}
              >
                Discover curated pieces inspired by the cosmos.
              </p>

              <Link
                href="/#products"
                onClick={(event) => {
                  if (pathname === "/" || pathname === "/dashboard") {
                    event.preventDefault();
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", "#products");
                    setActiveHash("products");
                  }
                }}
                className="animate-hero-fade-up inline-flex h-12 items-center rounded-full border border-black bg-black px-10 text-[11px] tracking-[0.22em] text-white uppercase transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                style={{ animationDelay: "300ms" }}
              >
                Shop Now
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div
              className="animate-hero-fade-in-right w-full max-w-[340px] overflow-hidden rounded-2xl sm:max-w-[380px] lg:max-w-[420px]"
              style={{ animationDelay: "150ms" }}
            >
              <Image
                src="/landing-image.jpg"
                alt="DeepSky collection"
                width={480}
                height={480}
                priority
                className="animate-hero-float h-auto w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </section>
      </DashboardGlassSection>

      {/* PRODUCTS SECTION */}
      <DashboardGlassSection
        id="products"
        variant="light"
        className="scroll-mt-24 border-t border-white/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
          <AnimateInView>
            <div className="mb-8 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
                Shop
              </p>
              <h2 className="font-serif text-2xl font-normal text-black sm:text-3xl">
                Featured Products
              </h2>
            </div>
          </AnimateInView>

          {featuredProductsError && featuredProductsStatus === "failed" ? (
            <p className="mb-6 text-sm text-red-600" role="alert">
              {featuredProductsError}
            </p>
          ) : null}

          {isFeaturedLoading ? (
            <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-black/50">
              <Loader2Icon className="size-5 animate-spin" aria-hidden />
              Loading featured products…
            </div>
          ) : displayedProducts.length === 0 ? (
            <div
              className={cn(
                glassCardClassName,
                "border-dashed px-6 py-12 text-center text-sm text-black/50",
              )}
            >
              No featured products yet. Check back soon for new arrivals.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
              {displayedProducts.map((product, index) => (
                <AnimateInView key={product.id} delay={index * 60}>
                  <ProductCard product={product} priority={index < 5} />
                </AnimateInView>
              ))}
            </div>
          )}
        </div>
      </DashboardGlassSection>

      <AboutUsSection />
      <ContactUsSection />
      <FooterSection />
    </div>
  );
}
